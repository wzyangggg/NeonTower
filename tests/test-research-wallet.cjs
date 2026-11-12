const assert=require('node:assert/strict');
let levels={};global.Specializations={ids:['pistol','electric_tower'],level:id=>levels[id]||0,set(id,n){levels[id]=n;return true;}};
const {createStore}=require('../dist/talents.js');
let raw=null;const storage={getItem:()=>raw,setItem:(key,value)=>{raw=value;}},store=createStore(storage);
assert(store.credit(1000,{skill0:3}));const stale=store.draft();
assert(store.purchaseResearch('pistol',0));assert.equal(store.view().balance,980);assert.equal(store.view().research.pistol,1);
assert.equal(store.purchaseResearch('pistol',0),false);assert.equal(store.purchaseResearch('pistol',3),false);assert.equal(store.purchaseResearch('unknown',0),false);assert.equal(store.save(stale),false);
for(let n=1;n<5;n++)assert(store.purchaseResearch('pistol',n));assert.equal(store.view().balance,500);assert.equal(store.purchaseResearch('pistol',5),false);
assert(store.credit(1));assert.equal(store.view().research.pistol,5);
const draft=store.draft();assert(store.change(draft,'damage',1));assert(store.save(draft));assert.equal(store.view().research.pistol,5);assert.equal(store.view().balance,476);
const refund=store.draft();store.reset(refund);assert(store.save(refund));assert.equal(store.view().balance,501);assert.equal(store.view().research.pistol,5);
const reopened=createStore(storage);assert.equal(reopened.researchLevel('pistol'),5);assert.equal(reopened.view().balance,501);
const concurrent=createStore(storage),oldDraft=reopened.draft();assert(concurrent.purchaseResearch('electric_tower',0));assert.equal(reopened.save(oldDraft),false);assert.equal(reopened.researchLevel('electric_tower'),1);
let poorRaw=JSON.stringify({version:1,balance:19,earned:19,levels:{},paid:{},revision:0});levels={};const poor=createStore({getItem:()=>poorRaw,setItem:(k,v)=>{poorRaw=v;}});assert.equal(poor.purchaseResearch('pistol',0),false);assert.equal(poor.view().balance,19);
const blocked=createStore({getItem(){throw Error('denied')},setItem(){throw Error('denied')}});assert(blocked.credit(100));assert(blocked.purchaseResearch('pistol',0));assert.equal(blocked.view().balance,80);assert.equal(blocked.researchLevel('pistol'),1);assert(blocked.warning);
require('../dist/tower-research.js');
{
 let saved=JSON.stringify({version:1,revision:8,balance:500,research:{electric_tower:3,pistol:1},towerResearch:{shotgun_tower:{wide:2,stagger:1}}});
 const disk={getItem:()=>saved,setItem:(_,value)=>{saved=value;}},store=createStore(disk),other=createStore(disk);
 assert.equal(store.view().balance,720); // Old electric tiers 140, wide 50 and stagger 30.
 assert.equal(other.view().balance,720);
 assert.equal(store.view().research.pistol,1);
 assert.equal(store.view().revision,9);
 const kind='sniper_tower';
 const buy=id=>store.purchaseTowerNode(kind,id,store.view().revision);
 assert(!buy('pierce'));
 assert(!buy('distance'));assert.equal(store.view().balance,720);
 assert(store.credit(0,{tower0:6,tower1:4,tower2:1}));
 assert(buy('distance'));
 const forkRevision=store.view().revision;
 assert(buy('rapid'));
 assert(!other.purchaseTowerNode(kind,'pierce',forkRevision));
 assert(!buy('pierce'));assert(!buy('column'));assert(!buy('caliber'));
 assert(buy('ballistic'));assert(!buy('recovery'));assert(buy('caliber'));assert(buy('bounty'));
 assert.equal(store.view().balance,420);
 assert.deepEqual(TowerResearch.effects(createStore(disk).view().towerPaths)[kind],{distance:2,cycle:.15,ballistic:.2,bounty:2});
 assert(store.resetTower(kind,store.view().revision));
 assert.equal(store.view().balance,720);assert.deepEqual(store.view().towerPaths,{});
 assert.deepEqual(store.view().materials,{tower0:6,tower1:4,tower2:1});
 assert(buy('distance'));assert(buy('pierce'));assert(buy('column'));assert(buy('caliber'));assert(buy('mark'));
}
{
 const kind='shotgun_tower',tree=TowerResearch.trees[kind];
 for(const [index,route] of [['choke','close','breach','cycle'],['wide','reverse','stagger','power']].entries()){
  const paid={turn:20};
  for(const [step,id] of route.entries()){
   const node=tree.nodes.find(n=>n.id===id);
   const states=TowerResearch.routeState(tree,paid);
   const available=tree.nodes.filter(n=>states[n.id].status==='available').map(n=>n.id);
   if(step===0)assert.deepEqual(available,['choke','wide']);
   else assert.deepEqual(available,[id]);
   assert.deepEqual(node.from,[step===0?'turn':route[step-1]]);
   assert.equal(node.x,index===0?.25:.75);
   paid[id]=node.cost;
  }
  assert.deepEqual(TowerResearch.validRoute(tree,paid),paid);
 }
 let saved=JSON.stringify({version:1,revision:4,balance:200,towerPaths:{
  [kind]:{turn:20,choke:40,close:60,stagger:80,cycle:100},electric_tower:{reach:15},
 }});
 const disk={getItem:()=>saved,setItem:(_,value)=>{saved=value;}},store=createStore(disk);
 assert.deepEqual(store.view().towerPaths,{[kind]:{turn:20,choke:40,close:60},electric_tower:{reach:15}});
 assert.equal(store.view().balance,380);
 assert.equal(createStore(disk).view().revision,5);
 assert.equal(createStore(disk).view().balance,380);
 assert(!store.purchaseTowerNode(kind,'stagger',5));
 assert(store.credit(0,{tower1:2,tower2:1}));
 assert(store.purchaseTowerNode(kind,'breach',6));
 assert(store.purchaseTowerNode(kind,'cycle',7));
 assert.equal(store.view().balance,200);
}
for(const tree of Object.values(TowerResearch.trees)){
 function visit(paid){
  const states=TowerResearch.routeState(tree,paid);
  const available=tree.nodes.filter(node=>states[node.id].status==='available');
  if(!available.length){
   assert.equal(Object.keys(paid).length,tree.depth,tree.name);
   assert.equal(Object.values(paid).reduce((a,b)=>a+b,0),300,tree.name);
   return;
  }
  for(const node of available)visit({...paid,[node.id]:node.cost});
 }
 visit({});
}
console.log('Research wallet: costs, sequential purchase, cap, insufficient balance, duplicate clicks, stale drafts, shared credits/refunds, reload, concurrent stores and storage failure passed');
