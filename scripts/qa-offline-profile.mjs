/** Disposable normal browser profile for QA that installs the real offline catalogue.
 * Incognito contexts use a smaller memory-backed quota; do not change application
 * caches or browser quotas to make an offline assertion pass. Call close after
 * retaining the report. Contexts that deliberately block workers stay separate.
 */
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

export async function launchOfflineQaProfile(chromium,options={}){
  const profileDirectory=await mkdtemp(join(tmpdir(),'halo-offline-qa-'));
  let context;
  try{context=await chromium.launchPersistentContext(profileDirectory,options);}
  catch(error){await rm(profileDirectory,{recursive:true,force:true});throw error;}
  let closing;
  return {
    browser:context.browser(),
    context,
    close(){
      // Idempotent, including concurrent calls; remove only this owned directory
      // after Playwright confirms that the persistent context has closed.
      return closing??=(async()=>{await context.close();await rm(profileDirectory,{recursive:true,force:true});})();
    }
  };
}
