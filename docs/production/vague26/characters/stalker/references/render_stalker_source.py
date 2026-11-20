"""Documentary rendering of untouched SH1 CLD2 model/animation/texture data.

The binary layout follows the museum's pinned ilm.ksy/sh1anm.ksy/psx_tim.ksy.
No downloaded script is executed. These are source-inspection renders, not sprites.
"""
import bpy, json, math, struct
from pathlib import Path
from mathutils import Matrix, Vector

ROOT = Path(__file__).resolve().parent
ilm = (ROOT/'CLD2.ILM').read_bytes()
anm = (ROOT/'CLD2.ANM').read_bytes()
tim = (ROOT/'CLD2.TIM').read_bytes()
def u(fmt, data, off):
    return struct.unpack_from('<'+fmt, data, off)

assert ilm[:2] == b'\x30\x06'
_, numobjs, objsofs, idsofs = u('4I',ilm,4)
frameofs,nrot,ntrans,framesize,nbones,flags,endofs,nframes,scale,_ = u('hBBhhiiHBB',anm,0)
assert framesize == nrot*9+ntrans*3
assert len(anm) >= frameofs + nframes*framesize
bones = [u('6b',anm,20+i*6) for i in range(nbones)]

def mesh_for_frame(frame):
    framepos=frameofs+frame*framesize
    trans=[u('3b',anm,framepos+i*3) for i in range(ntrans)]
    rotations=[u('9b',anm,framepos+ntrans*3+i*9) for i in range(nrot)]
    locals=[]
    for parent,ri,ti,x,y,z in bones:
        m=Matrix.Identity(4)
        if ri>=0:
            rr=rotations[ri]
            for row in range(3):
                for col in range(3): m[row][col]=rr[row*3+col]/128
            t=(x,y,z)
        else: t=trans[ti] if ti>=0 else (x,y,z)
        m.translation=Vector(tuple(v*(1<<scale) for v in t))
        locals.append(m)
    worlds={}
    def world(i):
        if i not in worlds:
            parent=bones[i][0]
            worlds[i]=world(parent)@locals[i] if parent>=0 else locals[i]
        return worlds[i]
    scratch={}; verts=[]; faces=[]; uvfaces=[]; palettes=[]; parts=[]
    for order in range(numobjs):
        oid=ilm[idsofs+order];o=objsofs+oid*16
        bi=int(ilm[o:o+2].decode('ascii'))
        name=ilm[o+2:o+8].split(b'\x00')[0].decode('ascii')
        base=ilm[o+9]; normalbase=ilm[o+10]; body=u('I',ilm,o+12)[0]
        np,nv,nn,_=u('4B',ilm,body)
        primofs,xyofs,zofs,normofs,nextofs=u('5I',ilm,body+4)
        m=world(bi)
        for vi in range(nv):
            x,y=u('2h',ilm,xyofs+vi*4);z=u('h',ilm,zofs+vi*2)[0]
            vec=m@Vector((x,y,z,1))
            scratch[base+vi]=(vec.x,vec.z,-vec.y)
        first=len(faces)
        for pi in range(np):
            p=primofs+pi*20
            uv=[u('2B',ilm,p+k)for k in (0,4,8,10)]
            palette=(u('H',ilm,p+2)[0]>>6)&511
            ind=u('4B',ilm,p+12)
            orders=[(2,1,0)] if ind[3]==255 else [(2,1,0),(1,2,3)]
            for tri in orders:
                vi0=len(verts)
                verts.extend(scratch[ind[k]]for k in tri)
                faces.append((vi0,vi0+1,vi0+2))
                uvfaces.append([uv[k] for k in tri]);palettes.append(palette)
        parts.append({'name':name,'bone':bi,'vertices':nv,'primitives':np,'triangles':len(faces)-first})
    return verts,faces,uvfaces,palettes,parts

assert u('I',tim,0)[0]==16 and u('I',tim,4)[0]==8
clen,cx,cy,cw,ch=u('I4H',tim,8)
imgofs=8+clen
ilen,ix,iy,iw,ih=u('I4H',tim,imgofs)
width=iw*4
packed=tim[imgofs+12:imgofs+ilen]
indexes=[]
for val in packed:indexes.extend((val&15,val>>4))
assert len(indexes)==width*ih

bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
materials=[]
for row in range(ch):
    palette=[]
    for j in range(cw):
        val=u('H',tim,20+(row*cw+j)*2)[0]
        r=(val&31)/31;g=((val>>5)&31)/31;b=((val>>10)&31)/31
        a=0 if val==0 else (0.5 if val&32768 and r+g+b else 1)
        palette.append((r,g,b,a))
    img=bpy.data.images.new('CLD2_TIM_palette_'+str(row),width=width,height=ih,alpha=True)
    # Blender stores pixel rows bottom-up; TIM stores top-down.
    px=[]
    for y in reversed(range(ih)):
        for x in range(width):px.extend(palette[indexes[y*width+x]])
    img.pixels=px;img.filepath_raw=str(ROOT/f'CLD2-palette-{row}.png');img.file_format='PNG';img.save()
    mat=bpy.data.materials.new('Original_CLD2_TIM_palette_'+str(row));mat.use_nodes=True
    ns=mat.node_tree.nodes;ns.clear();out=ns.new('ShaderNodeOutputMaterial');em=ns.new('ShaderNodeEmission');tx=ns.new('ShaderNodeTexImage');tx.image=img;tx.interpolation='Closest'
    mat.node_tree.links.new(tx.outputs['Color'],em.inputs['Color']);mat.node_tree.links.new(em.outputs[0],out.inputs['Surface'])
    materials.append(mat)

clay=bpy.data.materials.new('Neutral geometry inspection, not source colors');clay.diffuse_color=(.52,.54,.56,1);clay.use_nodes=True
clay.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.52,.54,.56,1)
clay.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=1

scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=12;scene.cycles.use_denoising=False
scene.render.resolution_x=1024;scene.render.resolution_y=1024;scene.render.resolution_percentage=100
scene.world.color=(.35,.35,.35);scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
scene.view_settings.view_transform='Standard';scene.view_settings.look='Medium High Contrast';scene.view_settings.exposure=0;scene.view_settings.gamma=1
camera_data=bpy.data.cameras.new('Documentary orthographic camera');camera=bpy.data.objects.new('Documentary camera',camera_data);scene.collection.objects.link(camera);scene.camera=camera;camera.data.type='ORTHO'
for name,loc,energy,size in [('key',(2,3,4),900,5),('fill',(-3,-1,2),450,5)]:
    data=bpy.data.lights.new(name,'AREA');data.energy=energy;data.shape='DISK';data.size=size
    obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=loc
    obj.rotation_euler=(Vector((0,0,1))-obj.location).to_track_quat('-Z','Y').to_euler()

records=[]
for frame in [0,477]:
    verts,faces,uvs,pals,parts=mesh_for_frame(frame)
    # Uniform scale changes units, not proportions, and is recorded.
    verts=[tuple(c/500 for c in v)for v in verts]
    mesh=bpy.data.meshes.new(f'CLD2_frame{frame}');mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(f'CLD2_frame{frame}',mesh);scene.collection.objects.link(obj)
    for mat in materials:mesh.materials.append(mat)
    layer=mesh.uv_layers.new(name='Original TIM UV')
    for p,uv,pal in zip(mesh.polygons,uvs,pals):
        p.material_index=pal
        for loop,co in zip(p.loop_indices,uv):layer.data[loop].uv=(co[0]/width,1-co[1]/ih)
    minv=Vector(tuple(min(v[i]for v in verts)for i in range(3)));maxv=Vector(tuple(max(v[i]for v in verts)for i in range(3)))
    center=(minv+maxv)/2;span=max(maxv-minv);camera.data.ortho_scale=span*1.24
    for view,direction in [('front',(0,1,0)),('back',(0,-1,0)),('right',(1,0,0)),('threequarter',(1,1,0))]:
        camera.location=center+Vector(direction).normalized()*span*3
        camera.rotation_euler=(center-camera.location).to_track_quat('-Z','Y').to_euler()
        for mode in ['texture','clay']:
            scene.view_layers[0].material_override=clay if mode=='clay' else None
            path=ROOT/f'CLD2-frame{frame}-{view}-{mode}.png'
            scene.render.filepath=str(path);bpy.ops.render.render(write_still=True)
            records.append({'frame':frame,'view':view,'mode':mode,'path':str(path),'width':1024,'height':1024,'bounds':{'min':list(minv),'max':list(maxv)},'camera':list(camera.location),'ortho_scale':camera.data.ortho_scale,'parts':parts,'triangles':len(faces)})
    bpy.data.objects.remove(obj,do_unlink=True)
(ROOT/'render-records.json').write_text(json.dumps({'source':'original CLD2 ILM + frame-specific CLD2 ANM + CLD2 TIM; documentary render, not engine screenshot','model_unit_scale':1/500,'axis_mapping':'Blender=(gameX,gameZ,-gameY)','engine':'Blender Cycles CPU','records':records},indent=2))
