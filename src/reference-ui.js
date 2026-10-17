/** Readable production evidence, shared by the archive and the versus dossier. */
import {FIGHTER_REFERENCES,STAGE_REFERENCES,REFERENCE_SOURCES} from './production-reference.js';
import {cinematicSummary} from './lore-cinematics.js';
import {escapeHTML as e} from './shared.js';

export const COMBAT_ROLE_LABELS=Object.freeze({combatant:'Combattant', 'stationary-boss':'Boss fixe', 'multi-body':'Corps multiples', 'scripted-encounter':'Rencontre scénarisée', 'environmental-obstacle':'Obstacle du décor',noncombatant:'Sujet non combattant',unverified:'Identité à confirmer'});
const proposalLabels={super:'Super',finisher:'Fatalité lore',intro:'Introduction',outro:'Sortie',winRound1:'Victoire de première manche',loseRound1:'Défaite de première manche',winMatch:'Victoire finale',loseMatch:'Défaite finale',taunt:'Attitude / provocation'};
export function referenceLinks(ids=[]){
 return [...new Set(ids)].map(id=>REFERENCE_SOURCES[id]).filter(s=>s&&/^https:\/\//.test(s.url)).map(s=>`<a href="${e(s.url)}" target="_blank" rel="noopener noreferrer">${e(s.title)}</a>`).join(' · ');
}
export function moveAvailabilityHTML(move){
 return move.enabled===false?`<p class="move-unavailable" role="note"><strong>INDISPONIBLE</strong> · ${e(move.disabledReason||'Ce geste ne correspond pas au rôle retenu.')}</p>`:'';
}
export function fighterRoleLabel(fighter,profile){
 const p=profile.referencePolicy||profile.moveset?.referencePolicy;
 if(!p)return '';
 if(p.combatEnabled===false)return `${COMBAT_ROLE_LABELS[p.role]||p.role} · consultation du dossier`;
 return (COMBAT_ROLE_LABELS[p.role]||p.role)+(p.adaptationMode==='versus-scripted'?' · adaptation versus scénarisée':'');
}
export function fighterReferenceHTML(fighter,profile){
 const ref=FIGHTER_REFERENCES[fighter.id];if(!ref)return '';
 const policy=profile.referencePolicy||profile.moveset?.referencePolicy||{};
 const moves=Object.values(profile.moves||{}),enabled=moves.filter(m=>m.enabled!==false).length;
 const observations=ref.observedMoves.map(o=>`<li><b>${e(o.name)}</b> — ${e(o.description)}</li>`).join('');
 const proposals=Object.entries(proposalLabels).map(([key,label])=>{const p=ref.proposals?.[key];return p?`<article data-production-id="${e(fighter.id+':'+key)}"><h4>${label}</h4><p>${e(p.description)}</p><small>${e(p.status)}</small></article>`:'';}).join('');
 const limitations=[policy.canMove===false?'Déplacement au sol désactivé':null,policy.canJump===false?'Saut désactivé':null,policy.canDodge===false?'Esquive désactivée':null,policy.superEnabled===false?(policy.superReason||'Super indisponible'):null].filter(Boolean);
 return `<section class="production-reference" data-reference-id="${e(fighter.id)}"><h3>FICHE DE RÉFÉRENCE · ${e(ref.referenceEdition||fighter.game)}</h3><p><strong>${e(fighterRoleLabel(fighter,profile))}</strong> · ${enabled}/${moves.length} commandes actives</p><p>${e(ref.identityNote)}</p>${limitations.length?`<p class="reference-limits">${e(limitations.join(' · '))}</p>`:''}<h4>Gestes relevés dans les références</h4><ul>${observations||'<li>Aucun geste de combat attesté dans cette fiche.</li>'}</ul><details><summary>Présentations et clôture lore prévues pour ce sujet</summary><p>Les descriptions ci-dessous sont les propositions de production. Leur présence dans le dossier ne certifie pas la livraison des images.</p><div class="reference-proposals">${proposals}</div></details><details><summary>Contraintes de la fiche</summary><ul>${ref.constraints.map(c=>`<li>${e(c)}</li>`).join('')}</ul></details><p class="reference-sources"><b>Références consultées :</b> ${referenceLinks(ref.referenceIds)}</p></section>`;
}
export function finisherReferenceHTML(fighter,definition){
 const summary=cinematicSummary(definition.id),proposal=FIGHTER_REFERENCES[fighter.id]?.proposals?.finisher;
 const description=summary.description||proposal?.description||'Mise en scène à produire.';
 return `<section class="production-finisher" data-cinematic-id="${e(definition.id)}"><h4>${e(definition.name)}</h4><strong>${summary.authored?'CHORÉGRAPHIE VERSUS JOUÉE':'CHORÉGRAPHIE À PRODUIRE'}</strong><p>${e(description)}</p>${summary.authored?`<ol>${summary.beats.map(b=>`<li>${e(b.label)}</li>`).join('')}</ol><small>Durée de base : ${summary.duration} ticks. Images propres à cette séquence à produire.</small>`:''}<p class="reference-sources">${referenceLinks(summary.referenceIds||proposal?.basis||[])}</p></section>`;
}
export function stageReferenceHTML(stage){
 const ref=STAGE_REFERENCES[stage.id];if(!ref)return '';
 const tracks=stage.referenceTracks||[];
 const rows=ref.animations.map((a,i)=>{const id=`${stage.id}:reference:${i+1}`,track=tracks.find(t=>t.id===id||t.productionId===id||t.referenceId===id);return `<li data-production-id="${e(id)}"><b>${e(a.name)}</b> — ${e(a.description)}<small>${track?'Prototype visuel partiel : '+e(track.implementedElement||track.name):'Proposition à produire ou capture à relever'}</small></li>`;}).join('');
 return `<section class="production-reference" data-reference-id="${e(stage.id)}"><h3>RÉFÉRENCE DU LIEU</h3><p>${e(ref.locationNote)}</p><p><strong>${stage.reference?.blocked?'Lieu en attente de confirmation':`${tracks.length} éléments visuels de la fiche joués`}</strong> · ${stage.shift?.enabled===false?'Bascule Otherworld désactivée':'Bascule versus autorisée'}</p><ul>${rows}</ul>${ref.constraints?.length?`<details><summary>Contraintes de cette arène</summary><ul>${ref.constraints.map(c=>`<li>${e(c)}</li>`).join('')}</ul></details>`:''}<p class="reference-sources">${referenceLinks(ref.referenceIds)}</p></section>`;
}
