import { useState, useEffect, useMemo } from "react";

const LOCATIONS = [
  "Office Building","WhereHouse Building","Arcade Building",
  "Tuxes & Tennies","The Spot","Community Days",
];
const ROLES_BY_LOCATION = {
  "Office Building": ["Construction & Rehab Crew","Painter","Electrician/AV Installer","Furnishings Setup","Cleaner/Organizer","Landscaping/Exterior"],
  "WhereHouse Building": ["Construction Crew","Fire Suppression Support","Furnishings Team","Landscaping Crew","Painter","Computer Setup","Cleaner/Organizer"],
  "Arcade Building": ["Flooring Crew","Plumbing Support","Room Rehab Crew","Furnishings Team","Exterior Crew","Cleaner/Organizer"],
  "Tuxes & Tennies": ["Event Setup Crew","Guest Registration","Auction Table Attendant","Food & Beverage Server","Program Support","VIP Host","Raffle Coordinator","Cleanup Crew","Social Media Volunteer"],
  "The Spot": ["Customer Checkout Assistant","Floor Stocker","Greeter/Customer Service","Merchandise Sorter","Box Organizer","Display Arranger","Inventory Counter"],
  "Community Days": ["Setup Crew Lead","Setup Crew Member","Greeter/Customer Host","Customer Navigator","Table Stocker","Storage Runner","Repack Crew","Cleanup Crew","Children's Area Volunteer"],
};
const AVAILABILITY_OPTIONS = [
  "Monday AM","Monday PM","Tuesday AM","Tuesday PM","Wednesday AM","Wednesday PM",
  "Thursday AM","Thursday PM","Friday AM","Friday PM","Saturday AM","Saturday PM","Sunday AM","Sunday PM",
];
const SKILLS = [
  "Construction/Carpentry","Plumbing","Electrical","Painting","Landscaping","IT/Computers",
  "Customer Service","Food Service","Event Planning","Photography/Social Media",
  "First Aid/CPR","Childcare","Driving/Transportation","Organization/Admin",
];
const RATING_CATEGORIES = [
  { key:"punctuality", label:"Punctuality & Reliability" },
  { key:"quality",     label:"Quality of Work" },
  { key:"attitude",    label:"Attitude & Teamwork" },
  { key:"communication", label:"Communication" },
  { key:"initiative",  label:"Initiative & Follow-through" },
];

// ── TIE-DYE PALETTE ──────────────────────────────────────────────────────────
const TD = {
  purple:"#7C3AED", pink:"#EC4899", teal:"#0D9488", lime:"#65A30D",
  amber:"#D97706",  magenta:"#BE185D", violet:"#6D28D9", cyan:"#0891B2",
  purpleLight:"#F5F3FF", pinkLight:"#FDF2F8", tealLight:"#F0FDFA",
  limeLight:"#F7FEE7", amberLight:"#FFFBEB",
  locColors:["#7C3AED","#EC4899","#0D9488","#D97706","#DC2626","#65A30D"],
  locLights:["#F5F3FF","#FDF2F8","#F0FDFA","#FFFBEB","#FEF2F2","#F7FEE7"],
};

function locColor(idx, light=false) {
  return light ? TD.locLights[idx % TD.locLights.length] : TD.locColors[idx % TD.locColors.length];
}

// ── SEED DATA ─────────────────────────────────────────────────────────────────
const SEED_VOLUNTEERS = [
  { id:"v1", name:"Marcus Johnson", email:"marcus@email.com", phone:"317-555-0101",
    locations:["WhereHouse Building","Community Days","Tuxes & Tennies"],
    skills:["Construction/Carpentry","Plumbing"], availability:["Saturday AM","Saturday PM","Sunday AM"],
    emergencyName:"Lisa Johnson", emergencyPhone:"317-555-0102", notes:"Retired contractor, very experienced.",
    signupDate:"2024-03-01", totalHours:48, showedUp:12, scheduled:12,
    ratings:[{location:"WhereHouse Building",role:"Construction Crew",punctuality:5,quality:5,attitude:5,communication:4,initiative:5,date:"2024-05-10",notes:"Exceptional work on bathroom rehab."}]},
  { id:"v2", name:"Tamara Williams", email:"tamara@email.com", phone:"317-555-0201",
    locations:["The Spot","Community Days"],
    skills:["Customer Service","Organization/Admin"], availability:["Saturday AM","Saturday PM","Friday AM","Friday PM"],
    emergencyName:"Ron Williams", emergencyPhone:"317-555-0202", notes:"",
    signupDate:"2024-04-15", totalHours:32, showedUp:8, scheduled:9,
    ratings:[
      {location:"The Spot",role:"Customer Checkout Assistant",punctuality:4,quality:5,attitude:5,communication:5,initiative:4,date:"2024-06-01",notes:"Customers love her."},
      {location:"Community Days",role:"Greeter/Customer Host",punctuality:4,quality:4,attitude:5,communication:5,initiative:4,date:"2024-07-15",notes:"Great with families."},
    ]},
  { id:"v3", name:"Derek Brown", email:"derek@email.com", phone:"317-555-0301",
    locations:["Office Building","Arcade Building"],
    skills:["Painting","Construction/Carpentry"], availability:["Wednesday AM","Thursday AM","Saturday AM"],
    emergencyName:"Beth Brown", emergencyPhone:"317-555-0302", notes:"Available for large projects with advance notice.",
    signupDate:"2024-02-20", totalHours:20, showedUp:5, scheduled:7,
    ratings:[{location:"Office Building",role:"Painter",punctuality:3,quality:4,attitude:4,communication:3,initiative:3,date:"2024-04-20",notes:"Good work but occasionally late."}]},
  { id:"v4", name:"Angela Torres", email:"angela@email.com", phone:"317-555-0401",
    locations:["Tuxes & Tennies","Community Days","The Spot"],
    skills:["Event Planning","Photography/Social Media","Customer Service"], availability:["Saturday AM","Saturday PM","Sunday AM","Sunday PM"],
    emergencyName:"Carlos Torres", emergencyPhone:"317-555-0402", notes:"Has own camera equipment.",
    signupDate:"2024-01-10", totalHours:60, showedUp:15, scheduled:15,
    ratings:[
      {location:"Tuxes & Tennies",role:"Social Media Volunteer",punctuality:5,quality:5,attitude:5,communication:5,initiative:5,date:"2024-03-20",notes:"Incredible photos!"},
      {location:"Community Days",role:"Greeter/Customer Host",punctuality:5,quality:5,attitude:5,communication:5,initiative:4,date:"2024-05-18",notes:"Outstanding with community members."},
    ]},
  { id:"v5", name:"James Patterson", email:"james@email.com", phone:"317-555-0501",
    locations:["WhereHouse Building","Arcade Building","Office Building"],
    skills:["Electrical","IT/Computers","Construction/Carpentry"], availability:["Monday PM","Tuesday PM","Wednesday PM","Saturday AM"],
    emergencyName:"Grace Patterson", emergencyPhone:"317-555-0502", notes:"Licensed electrician.",
    signupDate:"2024-05-01", totalHours:16, showedUp:4, scheduled:4,
    ratings:[{location:"WhereHouse Building",role:"Computer Setup",punctuality:5,quality:5,attitude:4,communication:4,initiative:4,date:"2024-06-10",notes:"Set up all computers flawlessly."}]},
];

// ── SCORING ───────────────────────────────────────────────────────────────────
function calcScore(vol) {
  const ratings = vol.ratings || [];
  let avgRating = 0;
  if (ratings.length > 0) {
    const s = ratings.reduce((acc,r) => acc + RATING_CATEGORIES.reduce((a,c)=>a+(r[c.key]||0),0)/RATING_CATEGORIES.length, 0);
    avgRating = s / ratings.length;
  }
  const reliability = vol.scheduled > 0 ? vol.showedUp/vol.scheduled : 0;
  const expFactor   = Math.min((vol.totalHours||0)/60, 1);
  const availFactor = Math.min((vol.availability?.length||0)/14, 1);
  return Math.round((avgRating/5)*40 + reliability*30 + expFactor*20 + availFactor*10);
}

function scoreMeta(score) {
  if (score >= 85) return { label:"Priority",   bg:"#FEF9C3", color:"#713F12", border:"#FDE047" };
  if (score >= 70) return { label:"Preferred",  bg:"#F0FDF4", color:"#14532D", border:"#86EFAC" };
  if (score >= 50) return { label:"Good",        bg:"#FDF4FF", color:"#581C87", border:"#D8B4FE" };
  return              { label:"Building",        bg:"#F9FAFB", color:"#374151", border:"#D1D5DB" };
}

function scoreGrad(score) {
  if (score >= 85) return "linear-gradient(90deg,#FACC15,#FB923C,#F472B6)";
  if (score >= 70) return "linear-gradient(90deg,#34D399,#60A5FA)";
  if (score >= 50) return "linear-gradient(90deg,#A78BFA,#60A5FA)";
  return "linear-gradient(90deg,#D1D5DB,#9CA3AF)";
}

// ── STORAGE ───────────────────────────────────────────────────────────────────
async function loadVols() {
  try { const r = await window.storage.get("rk_vols2"); if (r?.value) return JSON.parse(r.value); } catch(e) {}
  return SEED_VOLUNTEERS;
}
async function saveVols(v) { try { await window.storage.set("rk_vols2", JSON.stringify(v)); } catch(e) {} }

// ── STAR INPUT ────────────────────────────────────────────────────────────────
function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const cols = ["#F472B6","#FB923C","#FACC15","#34D399","#A78BFA"];
  return (
    <div style={{ display:"flex", gap:4 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n}
          onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)}
          onClick={()=>onChange(n)}
          style={{ cursor:"pointer", fontSize:26, transition:"transform 0.1s",
            color: n<=(hover||value) ? cols[n-1] : "#E5E7EB",
            transform: n<=(hover||value) ? "scale(1.2)" : "scale(1)", display:"inline-block" }}>★</span>
      ))}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]           = useState("signup");
  const [volunteers, setVols]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filterLoc, setFLoc]    = useState("All");
  const [filterRat, setFRat]    = useState("All");
  const [filterAvail,setFAvail] = useState("All");
  const [search, setSearch]     = useState("");
  const [form, setForm]         = useState({ name:"",email:"",phone:"",emergencyName:"",emergencyPhone:"",locations:[],skills:[],availability:[],notes:"" });
  const [formMsg, setFormMsg]   = useState("");
  const [formErr, setFormErr]   = useState("");
  const [rVolId, setRVolId]     = useState("");
  const [rLoc, setRLoc]         = useState("");
  const [rRole, setRRole]       = useState("");
  const [rScores, setRScores]   = useState({});
  const [rNotes, setRNotes]     = useState("");
  const [rMsg, setRMsg]         = useState("");

  useEffect(() => { loadVols().then(v=>{setVols(v);setLoading(false);}); }, []);

  const filtered = useMemo(() => {
    let list = volunteers.map(v=>({...v,score:calcScore(v)}));
    if (filterLoc !== "All") list = list.filter(v=>v.locations?.includes(filterLoc));
    if (filterAvail !== "All") list = list.filter(v=>v.availability?.includes(filterAvail));
    if (filterRat !== "All") list = list.filter(v=>v.score>=parseFloat(filterRat));
    if (search) { const s=search.toLowerCase(); list=list.filter(v=>v.name.toLowerCase().includes(s)||v.email.toLowerCase().includes(s)); }
    return list.sort((a,b)=>b.score-a.score);
  }, [volunteers,filterLoc,filterAvail,filterRat,search]);

  const upd = (k,v) => setForm(f=>({...f,[k]:v}));
  const tog = (k,v) => setForm(f=>({...f,[k]:f[k].includes(v)?f[k].filter(x=>x!==v):[...f[k],v]}));

  function handleSignup() {
    if (!form.name.trim()||!form.email.trim()||!form.phone.trim()) { setFormErr("Name, email, and phone are required."); return; }
    if (!form.locations.length) { setFormErr("Please select at least one location."); return; }
    if (!form.availability.length) { setFormErr("Please select at least one availability slot."); return; }
    const nv = { id:"v"+Date.now(), ...form, signupDate:new Date().toISOString().split("T")[0], totalHours:0, showedUp:0, scheduled:0, ratings:[] };
    const upd2 = [...volunteers, nv]; setVols(upd2); saveVols(upd2);
    setForm({ name:"",email:"",phone:"",emergencyName:"",emergencyPhone:"",locations:[],skills:[],availability:[],notes:"" });
    setFormErr(""); setFormMsg("Application submitted! Welcome to the Rupert's Kids volunteer family!");
    setTimeout(()=>setFormMsg(""), 6000);
  }

  function handleRate() {
    if (!rVolId||!rLoc||!rRole) { setRMsg("error:Select a volunteer, location, and role."); return; }
    if (RATING_CATEGORIES.find(c=>!rScores[c.key])) { setRMsg("error:Please rate all categories."); return; }
    const upd2 = volunteers.map(v => v.id!==rVolId ? v : {
      ...v, totalHours:v.totalHours+4, showedUp:v.showedUp+1, scheduled:v.scheduled+1,
      ratings:[...v.ratings,{location:rLoc,role:rRole,...rScores,date:new Date().toISOString().split("T")[0],notes:rNotes}]
    });
    setVols(upd2); saveVols(upd2);
    setRVolId(""); setRLoc(""); setRRole(""); setRScores({}); setRNotes("");
    setRMsg("success:Rating saved and priority score updated!"); setTimeout(()=>setRMsg(""),4000);
  }

  const stats = useMemo(()=>({
    total:volunteers.length,
    active:volunteers.filter(v=>v.totalHours>0).length,
    totalHrs:volunteers.reduce((a,v)=>a+(v.totalHours||0),0),
    priority:volunteers.filter(v=>calcScore(v)>=85).length,
  }),[volunteers]);

  const TABS = [
    {id:"signup",icon:"✏",label:"Sign Up",grad:"linear-gradient(135deg,#7C3AED,#EC4899)"},
    {id:"volunteers",icon:"◎",label:"Volunteers",grad:"linear-gradient(135deg,#0D9488,#0891B2)"},
    {id:"rate",icon:"★",label:"Rate",grad:"linear-gradient(135deg,#D97706,#EC4899)"},
    {id:"dashboard",icon:"◈",label:"Dashboard",grad:"linear-gradient(135deg,#65A30D,#0D9488)"},
  ];

  const skillCols = [TD.purple,TD.pink,TD.teal,TD.lime,TD.amber,TD.cyan,TD.magenta,TD.violet];
  const catCols   = [TD.purple,TD.pink,TD.teal,TD.lime,TD.amber];

  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", background:"#FAF7FF", minHeight:"100vh", color:"#1e293b" }}>

      {/* HEADER */}
      <div style={{ background:"linear-gradient(135deg,#3B0764 0%,#7C3AED 22%,#BE185D 45%,#D97706 68%,#065F46 100%)", padding:"22px 20px 20px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute",top:-50,left:-50,width:200,height:200,background:"rgba(236,72,153,0.3)",borderRadius:"50%",filter:"blur(50px)",pointerEvents:"none" }} />
        <div style={{ position:"absolute",top:0,right:80,width:160,height:160,background:"rgba(250,204,21,0.25)",borderRadius:"50%",filter:"blur(40px)",pointerEvents:"none" }} />
        <div style={{ position:"absolute",bottom:-40,left:"38%",width:180,height:180,background:"rgba(13,148,136,0.25)",borderRadius:"50%",filter:"blur(45px)",pointerEvents:"none" }} />
        <div style={{ maxWidth:960,margin:"0 auto",position:"relative",zIndex:1 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:18 }}>
            <div style={{ width:54,height:54,borderRadius:"50%",background:"linear-gradient(135deg,#FACC15,#F472B6,#A78BFA,#34D399)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,boxShadow:"0 0 0 3px rgba(255,255,255,0.25)",flexShrink:0 }}>🤝</div>
            <div>
              <div style={{ color:"#FDE68A",fontSize:11,fontWeight:700,letterSpacing:3,textTransform:"uppercase" }}>Rupert's Kids</div>
              <h1 style={{ margin:0,color:"#fff",fontSize:22,fontWeight:900,textShadow:"0 2px 12px rgba(0,0,0,0.3)" }}>Volunteer Management System</h1>
            </div>
          </div>
          <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
            {[
              {label:"Volunteers",val:stats.total,g:"linear-gradient(135deg,rgba(124,58,237,0.65),rgba(236,72,153,0.65))"},
              {label:"Active",val:stats.active,g:"linear-gradient(135deg,rgba(13,148,136,0.65),rgba(8,145,178,0.65))"},
              {label:"Hours",val:stats.totalHrs,g:"linear-gradient(135deg,rgba(217,119,6,0.65),rgba(236,72,153,0.65))"},
              {label:"Priority Picks",val:stats.priority,g:"linear-gradient(135deg,rgba(250,204,21,0.65),rgba(34,197,94,0.65))"},
            ].map(s=>(
              <div key={s.label} style={{ background:s.g,backdropFilter:"blur(8px)",borderRadius:12,padding:"8px 18px",textAlign:"center",border:"1px solid rgba(255,255,255,0.2)" }}>
                <div style={{ color:"#fff",fontSize:22,fontWeight:900 }}>{s.val}</div>
                <div style={{ color:"rgba(255,255,255,0.8)",fontSize:11 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RAINBOW STRIP */}
      <div style={{ height:4,background:"linear-gradient(90deg,#7C3AED,#EC4899,#F59E0B,#34D399,#0891B2,#7C3AED)" }} />

      {/* TABS */}
      <div style={{ background:"#fff",borderBottom:"1.5px solid #F3E8FF",position:"sticky",top:0,zIndex:10 }}>
        <div style={{ maxWidth:960,margin:"0 auto",display:"flex" }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:"13px 22px",border:"none",background:"none",cursor:"pointer",
              fontSize:13,fontWeight:tab===t.id?800:500,
              color:tab===t.id?"transparent":"#64748b",
              backgroundImage:tab===t.id?t.grad:undefined,
              WebkitBackgroundClip:tab===t.id?"text":undefined,
              backgroundClip:tab===t.id?"text":undefined,
              borderBottom:tab===t.id?`3px solid transparent`:"3px solid transparent",
              position:"relative",whiteSpace:"nowrap",
              display:"flex",alignItems:"center",gap:6,
            }}>
              {tab===t.id && <div style={{ position:"absolute",bottom:0,left:0,right:0,height:3,background:t.grad,borderRadius:"3px 3px 0 0" }} />}
              <span style={{ fontFamily:"monospace",fontSize:15 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:960,margin:"0 auto",padding:"24px 16px" }}>
        {loading ? (
          <div style={{ textAlign:"center",padding:60 }}>
            <div style={{ fontSize:52,marginBottom:16,display:"inline-block",animation:"spin 1.2s linear infinite" }}>🌀</div>
            <div style={{ background:"linear-gradient(135deg,#7C3AED,#EC4899,#F59E0B)",WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent",fontSize:18,fontWeight:800 }}>Loading...</div>
          </div>
        ) : <>

          {/* ══ SIGN UP ════════════════════════════════════════════════ */}
          {tab==="signup" && (
            <div style={{ background:"#fff",borderRadius:18,padding:28,boxShadow:"0 4px 24px rgba(124,58,237,0.1)",border:"1.5px solid #EDE9FE" }}>
              <div style={{ marginBottom:24 }}>
                <div style={{ display:"inline-block",background:"linear-gradient(135deg,#7C3AED,#EC4899)",borderRadius:14,padding:"10px 22px",marginBottom:12 }}>
                  <span style={{ color:"#fff",fontWeight:800,fontSize:17 }}>Volunteer Sign-Up Form</span>
                </div>
                <p style={{ margin:0,color:"#64748b",fontSize:14 }}>Join the Rupert's Kids volunteer family! Fill out all starred (*) fields.</p>
              </div>

              {formMsg && <div style={{ background:"#F0FDF4",border:"2px solid #86EFAC",borderRadius:10,padding:"12px 16px",marginBottom:20,color:"#14532D",fontSize:14,fontWeight:600 }}>{formMsg}</div>}
              {formErr && <div style={{ background:"#FEF2F2",border:"2px solid #FCA5A5",borderRadius:10,padding:"12px 16px",marginBottom:20,color:"#991B1B",fontSize:14 }}>{formErr}</div>}

              <Sec title="Personal Information" c={TD.purple}>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                  <Fld label="Full Name *"><input style={INP} value={form.name} onChange={e=>upd("name",e.target.value)} placeholder="First Last" /></Fld>
                  <Fld label="Email *"><input style={INP} type="email" value={form.email} onChange={e=>upd("email",e.target.value)} placeholder="you@email.com" /></Fld>
                  <Fld label="Phone *"><input style={INP} value={form.phone} onChange={e=>upd("phone",e.target.value)} placeholder="317-555-0000" /></Fld>
                </div>
              </Sec>

              <Sec title="Emergency Contact" c={TD.pink}>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                  <Fld label="Contact Name"><input style={INP} value={form.emergencyName} onChange={e=>upd("emergencyName",e.target.value)} placeholder="Name" /></Fld>
                  <Fld label="Contact Phone"><input style={INP} value={form.emergencyPhone} onChange={e=>upd("emergencyPhone",e.target.value)} placeholder="317-555-0000" /></Fld>
                </div>
              </Sec>

              <Sec title="Preferred Locations *" c={TD.teal}>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8 }}>
                  {LOCATIONS.map((loc,i)=><Pill key={loc} label={loc} checked={form.locations.includes(loc)} onChange={()=>tog("locations",loc)} c={locColor(i)} bg={locColor(i,true)} />)}
                </div>
              </Sec>

              <Sec title="Skills & Experience" c={TD.amber}>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8 }}>
                  {SKILLS.map((sk,i)=><Pill key={sk} label={sk} checked={form.skills.includes(sk)} onChange={()=>tog("skills",sk)} c={skillCols[i%skillCols.length]} bg={skillCols[i%skillCols.length]+"18"} />)}
                </div>
              </Sec>

              <Sec title="Availability *" c={TD.lime}>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))",gap:8 }}>
                  {AVAILABILITY_OPTIONS.map((a,i)=><Pill key={a} label={a} checked={form.availability.includes(a)} onChange={()=>tog("availability",a)} c={skillCols[i%skillCols.length]} bg={skillCols[i%skillCols.length]+"18"} />)}
                </div>
              </Sec>

              <Sec title="Additional Notes" c={TD.cyan}>
                <textarea style={{ ...INP,height:80,resize:"vertical" }} value={form.notes} onChange={e=>upd("notes",e.target.value)} placeholder="Any skills, questions, or notes for the coordinator..." />
              </Sec>

              <button onClick={handleSignup} style={{ background:"linear-gradient(135deg,#7C3AED,#EC4899,#F59E0B)",color:"#fff",border:"none",borderRadius:12,padding:"14px 38px",fontSize:15,fontWeight:800,cursor:"pointer",boxShadow:"0 4px 20px rgba(124,58,237,0.4)" }}>
                Submit Application 🌈
              </button>
            </div>
          )}

          {/* ══ VOLUNTEERS ═════════════════════════════════════════════ */}
          {tab==="volunteers" && (
            <div>
              <div style={{ background:"#fff",borderRadius:14,padding:20,boxShadow:"0 2px 14px rgba(13,148,136,0.1)",marginBottom:20,border:"1.5px solid #CCFBF1" }}>
                <div style={{ fontWeight:800,marginBottom:14,fontSize:15,background:"linear-gradient(135deg,#0D9488,#0891B2)",WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent" }}>Filter & Search</div>
                <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:12 }}>
                  <Fld label="Search"><input style={INP} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name or email..." /></Fld>
                  <Fld label="Location"><select style={INP} value={filterLoc} onChange={e=>setFLoc(e.target.value)}><option value="All">All Locations</option>{LOCATIONS.map(l=><option key={l}>{l}</option>)}</select></Fld>
                  <Fld label="Min Score"><select style={INP} value={filterRat} onChange={e=>setFRat(e.target.value)}><option value="All">Any Score</option><option value="80">80+ Priority</option><option value="60">60+ Preferred</option><option value="40">40+ Good</option></select></Fld>
                  <Fld label="Available"><select style={INP} value={filterAvail} onChange={e=>setFAvail(e.target.value)}><option value="All">Any Time</option>{AVAILABILITY_OPTIONS.map(a=><option key={a}>{a}</option>)}</select></Fld>
                </div>
                <div style={{ marginTop:8,fontSize:12,color:"#94a3b8" }}>Showing {filtered.length} of {volunteers.length} · sorted by priority score</div>
              </div>

              <div style={{ display:"flex",gap:8,marginBottom:16,flexWrap:"wrap" }}>
                {[{l:"⭐ Priority (85+)",bg:"#FEF9C3",c:"#713F12",b:"#FDE047"},{l:"✓ Preferred (70–84)",bg:"#F0FDF4",c:"#14532D",b:"#86EFAC"},{l:"Good (50–69)",bg:"#FDF4FF",c:"#581C87",b:"#D8B4FE"},{l:"Building (<50)",bg:"#F9FAFB",c:"#374151",b:"#D1D5DB"}]
                  .map(x=><span key={x.l} style={{ background:x.bg,color:x.c,border:`1.5px solid ${x.b}`,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700 }}>{x.l}</span>)}
              </div>

              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                {filtered.length===0 && <div style={{ background:"#fff",borderRadius:14,padding:40,textAlign:"center",color:"#94a3b8" }}>No volunteers match filters.</div>}
                {filtered.map((vol,idx)=>{
                  const meta=scoreMeta(vol.score); const g=scoreGrad(vol.score);
                  const avgR=vol.ratings.length>0?(vol.ratings.reduce((s,r)=>s+RATING_CATEGORIES.reduce((a,c)=>a+(r[c.key]||0),0)/RATING_CATEGORIES.length,0)/vol.ratings.length).toFixed(1):"—";
                  const rel=vol.scheduled>0?Math.round(vol.showedUp/vol.scheduled*100)+"%":"N/A";
                  return (
                    <div key={vol.id} style={{ background:"#fff",borderRadius:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",border:"1.5px solid #F3E8FF" }}>
                      <div style={{ height:4,background:g }} />
                      <div style={{ padding:"16px 20px" }}>
                        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:5 }}>
                              <span style={{ fontWeight:900,fontSize:16 }}>#{idx+1} {vol.name}</span>
                              <span style={{ background:meta.bg,color:meta.color,border:`1.5px solid ${meta.border}`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700 }}>{meta.label}</span>
                            </div>
                            <div style={{ fontSize:13,color:"#64748b",marginBottom:8 }}>{vol.email} · {vol.phone} · Joined {vol.signupDate}</div>
                            <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginBottom:8 }}>
                              {vol.locations.map((l,li)=>{
                                const li2=LOCATIONS.indexOf(l); const c=locColor(li2); const bg=locColor(li2,true);
                                return <span key={l} style={{ background:bg,color:c,border:`1px solid ${c}50`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700 }}>{l}</span>;
                              })}
                            </div>
                            <div style={{ fontSize:12,color:"#94a3b8" }}><strong style={{ color:"#64748b" }}>Available:</strong> {vol.availability?.join(", ")||"—"}</div>
                            {vol.skills?.length>0&&<div style={{ fontSize:12,color:"#94a3b8",marginTop:3 }}><strong style={{ color:"#64748b" }}>Skills:</strong> {vol.skills.join(", ")}</div>}
                            {vol.notes&&<div style={{ fontSize:12,color:"#94a3b8",marginTop:3,fontStyle:"italic" }}>"{vol.notes}"</div>}
                          </div>
                          <div style={{ background:"linear-gradient(135deg,#FAFAFA,#F5F3FF)",borderRadius:12,padding:"12px 18px",textAlign:"center",minWidth:118,border:"1.5px solid #EDE9FE" }}>
                            <div style={{ fontSize:34,fontWeight:900,background:g,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent",lineHeight:1 }}>{vol.score}</div>
                            <div style={{ fontSize:10,color:"#94a3b8",marginBottom:8 }}>PRIORITY SCORE</div>
                            <div style={{ height:6,background:"#EDE9FE",borderRadius:3,overflow:"hidden",marginBottom:10 }}>
                              <div style={{ background:g,width:`${vol.score}%`,height:"100%",borderRadius:3 }} />
                            </div>
                            {[["Rating",`${avgR}${avgR!=="—"?" /5":""}`],["Reliable",rel],["Hours",vol.totalHours],["Reviews",vol.ratings.length]].map(([k,v])=>(
                              <div key={k} style={{ fontSize:11,marginBottom:2,textAlign:"left" }}><span style={{ color:"#94a3b8" }}>{k}:</span> <strong>{v}</strong></div>
                            ))}
                          </div>
                        </div>

                        {vol.ratings.length>0&&(
                          <details style={{ marginTop:12 }}>
                            <summary style={{ fontSize:13,cursor:"pointer",fontWeight:700,userSelect:"none",background:"linear-gradient(135deg,#7C3AED,#EC4899)",WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent" }}>View {vol.ratings.length} rating{vol.ratings.length>1?"s":""}</summary>
                            <div style={{ marginTop:10,display:"flex",flexDirection:"column",gap:8 }}>
                              {vol.ratings.map((r,ri)=>{
                                const avg=(RATING_CATEGORIES.reduce((a,c)=>a+(r[c.key]||0),0)/RATING_CATEGORIES.length).toFixed(1);
                                return (
                                  <div key={ri} style={{ background:"linear-gradient(135deg,#FAFAFA,#F5F3FF)",borderRadius:10,padding:"10px 14px",fontSize:12 }}>
                                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                                      <span><strong>{r.location}</strong> — {r.role}</span>
                                      <span style={{ color:"#64748b" }}>{r.date} · {avg}/5</span>
                                    </div>
                                    <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                                      {RATING_CATEGORIES.map((c,ci)=>(
                                        <span key={c.key} style={{ background:`${catCols[ci]}18`,color:catCols[ci],borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700 }}>{c.label}: {r[c.key]}/5</span>
                                      ))}
                                    </div>
                                    {r.notes&&<div style={{ marginTop:6,color:"#64748b",fontStyle:"italic" }}>"{r.notes}"</div>}
                                  </div>
                                );
                              })}
                            </div>
                          </details>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ RATE ═══════════════════════════════════════════════════ */}
          {tab==="rate" && (
            <div style={{ background:"#fff",borderRadius:18,padding:28,boxShadow:"0 4px 24px rgba(217,119,6,0.1)",border:"1.5px solid #FEF3C7" }}>
              <div style={{ marginBottom:24 }}>
                <div style={{ display:"inline-block",background:"linear-gradient(135deg,#D97706,#EC4899)",borderRadius:14,padding:"10px 22px",marginBottom:12 }}>
                  <span style={{ color:"#fff",fontWeight:800,fontSize:17 }}>Rate a Volunteer</span>
                </div>
                <p style={{ margin:0,color:"#64748b",fontSize:14 }}>Ratings power the Priority Score and scheduling preference.</p>
              </div>

              {rMsg&&<div style={{ background:rMsg.startsWith("error:")?"#FEF2F2":"#F0FDF4",border:`2px solid ${rMsg.startsWith("error:")?"#FCA5A5":"#86EFAC"}`,borderRadius:10,padding:"12px 16px",marginBottom:20,color:rMsg.startsWith("error:")?"#991B1B":"#14532D",fontSize:14 }}>{rMsg.replace(/^(error:|success:)/,"")}</div>}

              <Sec title="Select Volunteer" c={TD.amber}>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14 }}>
                  <Fld label="Volunteer *"><select style={INP} value={rVolId} onChange={e=>{setRVolId(e.target.value);setRLoc("");setRRole("");}}><option value="">— Select —</option>{[...volunteers].sort((a,b)=>a.name.localeCompare(b.name)).map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select></Fld>
                  <Fld label="Location *"><select style={INP} value={rLoc} onChange={e=>{setRLoc(e.target.value);setRRole("");}} disabled={!rVolId}><option value="">— Select —</option>{(rVolId?volunteers.find(v=>v.id===rVolId)?.locations||[]:[]).map(l=><option key={l}>{l}</option>)}</select></Fld>
                  <Fld label="Role *"><select style={INP} value={rRole} onChange={e=>setRRole(e.target.value)} disabled={!rLoc}><option value="">— Select —</option>{(rLoc?ROLES_BY_LOCATION[rLoc]||[]:[]).map(r=><option key={r}>{r}</option>)}</select></Fld>
                </div>
                {rVolId&&(()=>{
                  const vol=volunteers.find(v=>v.id===rVolId); const sc=calcScore(vol);
                  return (
                    <div style={{ marginTop:14,background:"linear-gradient(135deg,#F5F3FF,#FDF4FF)",borderRadius:10,padding:"14px 16px",display:"flex",alignItems:"center",gap:16,border:"1.5px solid #EDE9FE" }}>
                      <div style={{ width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#7C3AED,#EC4899)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,color:"#fff",fontWeight:800 }}>{vol.name[0]}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:800 }}>{vol.name}</div>
                        <div style={{ fontSize:12,color:"#64748b" }}>{vol.totalHours} hrs · {vol.ratings.length} reviews</div>
                      </div>
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontSize:28,fontWeight:900,background:scoreGrad(sc),WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent" }}>{sc}</div>
                        <div style={{ fontSize:10,color:"#94a3b8" }}>SCORE</div>
                      </div>
                    </div>
                  );
                })()}
              </Sec>

              <Sec title="Performance Ratings" c={TD.pink}>
                <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  {RATING_CATEGORIES.map((cat,ci)=>(
                    <div key={cat.key} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:`linear-gradient(135deg,${catCols[ci]}0D,${catCols[(ci+1)%5]}0D)`,borderRadius:10,border:`1.5px solid ${catCols[ci]}30` }}>
                      <div>
                        <div style={{ fontWeight:700,fontSize:14,color:catCols[ci] }}>{cat.label}</div>
                        <div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>{rScores[cat.key]?["","Needs Improvement","Below Average","Average","Good","Exceptional"][rScores[cat.key]]:"Not rated"}</div>
                      </div>
                      <StarInput value={rScores[cat.key]||0} onChange={v=>setRScores(s=>({...s,[cat.key]:v}))} />
                    </div>
                  ))}
                </div>
                {Object.keys(rScores).length===RATING_CATEGORIES.length&&(
                  <div style={{ marginTop:12,background:"linear-gradient(135deg,#FDF4FF,#FFFBEB)",borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",border:"1.5px solid #EDE9FE" }}>
                    <span style={{ fontWeight:700,background:"linear-gradient(135deg,#7C3AED,#EC4899)",WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent" }}>Session Average:</span>
                    <span style={{ fontSize:22,fontWeight:900,color:TD.amber }}>{(Object.values(rScores).reduce((a,b)=>a+b,0)/RATING_CATEGORIES.length).toFixed(1)} / 5</span>
                  </div>
                )}
              </Sec>

              <Sec title="Notes (Optional)" c={TD.teal}>
                <textarea style={{ ...INP,height:80,resize:"vertical" }} value={rNotes} onChange={e=>setRNotes(e.target.value)} placeholder="Specific feedback or observations..." />
              </Sec>

              <button onClick={handleRate} style={{ background:"linear-gradient(135deg,#D97706,#EC4899,#7C3AED)",color:"#fff",border:"none",borderRadius:12,padding:"14px 38px",fontSize:15,fontWeight:800,cursor:"pointer",boxShadow:"0 4px 20px rgba(236,72,153,0.4)" }}>
                Submit Rating 🌈
              </button>
            </div>
          )}

          {/* ══ DASHBOARD ══════════════════════════════════════════════ */}
          {tab==="dashboard" && (
            <div>
              <div style={{ background:"#fff",borderRadius:16,padding:24,boxShadow:"0 2px 16px rgba(124,58,237,0.09)",marginBottom:20,border:"1.5px solid #EDE9FE" }}>
                <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#FACC15,#FB923C,#F472B6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>🏆</div>
                  <h2 style={{ margin:0,fontSize:18,fontWeight:800,background:"linear-gradient(135deg,#7C3AED,#EC4899)",WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent" }}>Priority Leaderboard</h2>
                </div>
                <div style={{ background:"linear-gradient(135deg,#F5F3FF,#FDF4FF)",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#64748b",marginBottom:16,border:"1px solid #EDE9FE" }}>
                  Score = Quality (40%) + Reliability (30%) + Experience (20%) + Availability (10%)
                </div>
                {[...volunteers].map(v=>({...v,score:calcScore(v)})).sort((a,b)=>b.score-a.score).map((vol,idx)=>{
                  const meta=scoreMeta(vol.score); const g=scoreGrad(vol.score);
                  const rel=vol.scheduled>0?Math.round(vol.showedUp/vol.scheduled*100):0;
                  const rkG=["linear-gradient(135deg,#FACC15,#FB923C)","linear-gradient(135deg,#94A3B8,#CBD5E1)","linear-gradient(135deg,#CD7C2E,#F59E0B)"];
                  return (
                    <div key={vol.id} style={{ display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderBottom:idx<volunteers.length-1?"1px solid #F5F3FF":"none" }}>
                      <div style={{ width:34,height:34,borderRadius:"50%",background:idx<3?rkG[idx]:"#F3F4F6",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,color:idx<3?"#fff":"#64748b",flexShrink:0 }}>{idx+1}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:2 }}>
                          <span style={{ fontWeight:700 }}>{vol.name}</span>
                          <span style={{ background:meta.bg,color:meta.color,border:`1px solid ${meta.border}`,borderRadius:20,padding:"1px 8px",fontSize:10,fontWeight:700 }}>{meta.label}</span>
                        </div>
                        <div style={{ fontSize:12,color:"#94a3b8" }}>{vol.locations.join(" · ")}</div>
                      </div>
                      <div style={{ width:160 }}>
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4 }}>
                          <span style={{ color:"#94a3b8" }}>Score</span>
                          <span style={{ fontWeight:900,background:g,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent" }}>{vol.score}</span>
                        </div>
                        <div style={{ background:"#EDE9FE",borderRadius:4,height:8,overflow:"hidden" }}>
                          <div style={{ background:g,width:`${vol.score}%`,height:"100%",borderRadius:4 }} />
                        </div>
                      </div>
                      <div style={{ textAlign:"right",fontSize:12,minWidth:70 }}>
                        <div style={{ color:"#64748b" }}>{vol.totalHours} hrs</div>
                        <div style={{ color:"#94a3b8" }}>{rel}% reliable</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ background:"#fff",borderRadius:16,padding:24,boxShadow:"0 2px 16px rgba(13,148,136,0.08)",border:"1.5px solid #CCFBF1" }}>
                <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:18 }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#0D9488,#0891B2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>📍</div>
                  <h2 style={{ margin:0,fontSize:18,fontWeight:800,background:"linear-gradient(135deg,#0D9488,#0891B2)",WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent" }}>Volunteers by Location</h2>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14 }}>
                  {LOCATIONS.map((loc,li)=>{
                    const lv=volunteers.filter(v=>v.locations?.includes(loc)).map(v=>({...v,score:calcScore(v)})).sort((a,b)=>b.score-a.score);
                    const c=locColor(li); const bg=locColor(li,true);
                    return (
                      <div key={loc} style={{ background:bg,borderRadius:12,padding:16,border:`1.5px solid ${c}40` }}>
                        <div style={{ fontWeight:800,color:c,marginBottom:6,fontSize:14 }}>{loc}</div>
                        <div style={{ fontSize:12,color:`${c}99`,marginBottom:10 }}>{lv.length} volunteer{lv.length!==1?"s":""}</div>
                        {lv.length===0?<div style={{ color:`${c}66`,fontSize:12,fontStyle:"italic" }}>No volunteers yet.</div>
                          :lv.map(v=>(
                            <div key={v.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${c}20` }}>
                              <span style={{ fontSize:13 }}>{v.name}</span>
                              <span style={{ fontWeight:900,fontSize:13,background:scoreGrad(v.score),WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent" }}>{v.score}</span>
                            </div>
                          ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>}
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}details summary::-webkit-details-marker{display:none}input:focus,select:focus,textarea:focus{outline:2px solid #7C3AED;outline-offset:1px}`}</style>
    </div>
  );
}

function Sec({ title, c, children }) {
  return (
    <div style={{ marginBottom:26 }}>
      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
        <div style={{ width:4,height:18,background:c,borderRadius:2 }} />
        <span style={{ fontWeight:800,fontSize:15,color:c }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Fld({ label, children }) {
  return (
    <div>
      <label style={{ display:"block",fontWeight:700,fontSize:11,color:"#64748b",marginBottom:5,textTransform:"uppercase",letterSpacing:0.8 }}>{label}</label>
      {children}
    </div>
  );
}

function Pill({ label, checked, onChange, c, bg }) {
  return (
    <label style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer",background:checked?bg:"#FAFAFA",border:`1.5px solid ${checked?c:"#E5E7EB"}`,borderRadius:10,padding:"9px 13px",fontSize:13,transition:"all 0.15s",userSelect:"none",boxShadow:checked?`0 2px 8px ${c}30`:"none" }}>
      <div style={{ width:17,height:17,borderRadius:5,background:checked?c:"transparent",border:`2px solid ${checked?c:"#D1D5DB"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s" }}>
        {checked&&<span style={{ color:"#fff",fontSize:10,fontWeight:900,lineHeight:1 }}>✓</span>}
      </div>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display:"none" }} />
      <span style={{ color:checked?c:"#475569",fontWeight:checked?700:400 }}>{label}</span>
    </label>
  );
}

const INP = { width:"100%",padding:"9px 12px",border:"1.5px solid #E5E7EB",borderRadius:9,fontSize:14,fontFamily:"inherit",background:"#FAFAFA",color:"#1e293b",outline:"none",boxSizing:"border-box",transition:"border-color 0.2s" };
