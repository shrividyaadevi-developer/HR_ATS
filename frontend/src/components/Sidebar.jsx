import { RxDashboard } from "react-icons/rx";
import { MdWorkOutline, MdOutlineManageAccounts } from "react-icons/md";
import { SlPeople } from "react-icons/sl";
import { BsPersonWorkspace } from "react-icons/bs";
import { HiOutlineDocumentReport } from "react-icons/hi";

const BASE_NAV = [
  { id:"dashboard",   label:"Dashboard",  icon:<RxDashboard /> },
  { id:"jobs",        label:"Jobs",        icon:<MdWorkOutline /> },
  { id:"candidates",  label:"Candidates", icon:<SlPeople /> },
  { id:"interviews",  label:"Interviews", icon:<BsPersonWorkspace /> },
  { id:"insights",    label:"Insights",   icon:<HiOutlineDocumentReport /> },
];

export default function Sidebar({ open, active, onNav, role }) {
  const nav = role === "admin"
    ? [...BASE_NAV, { id:"manage-hr", label:"Manage HR", icon:<MdOutlineManageAccounts /> }]
    : BASE_NAV;

  return (
    <aside style={{ width:open ? 215 : 56,
      background:"var(--surface)", borderRight:"1px solid var(--border)",
      transition:"width .23s cubic-bezier(.4,0,.2,1)",
      overflow:"hidden", flexShrink:0,
      display:"flex", flexDirection:"column", padding:"8px 5px", gap:2 }}>
      {nav.map(n => {
        const isA = active === n.id;
        return (
          <button key={n.id} onClick={() => onNav(n.id)}
            style={{ display:"flex", alignItems:"center", gap:11,
              padding:"10px 10px", borderRadius:9,
              background: isA ? "var(--accent)" : "none",
              border:"1.5px solid " + (isA ? "var(--accent)" : "transparent"),
              color: isA ? "#fff" : "var(--muted)",
              cursor:"pointer", fontSize:15, fontWeight:600,
              whiteSpace:"nowrap", textAlign:"left" }}
            onMouseOver={e => { if(!isA){ e.currentTarget.style.background="var(--surface2)"; e.currentTarget.style.color="var(--text)"; }}}
            onMouseOut={e => { if(!isA){ e.currentTarget.style.background="none"; e.currentTarget.style.color="var(--muted)"; }}}>
            <span style={{ fontSize:16, flexShrink:0 }}>{n.icon}</span>
            {open && <span style={{ fontSize:13 }}>{n.label}</span>}
          </button>
        );
      })}
    </aside>
  );
}
