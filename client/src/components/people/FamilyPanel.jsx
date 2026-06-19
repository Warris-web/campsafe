import { useState, useEffect } from "react";
import { api } from "../../services/api";
import PersonForm from "./PersonForm";
import FamilyForm from "./FamilyForm";
import { Avatar } from "../tracker/TrackerList";

export default function FamilyPanel({ trackers, onSelectTracker }) {
  const [families, setFamilies] = useState([]);
  const [singles,  setSingles]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [modal,    setModal]    = useState(null);

  const trackerMap = {};
  trackers.forEach((t) => { trackerMap[t.device_id] = t; });

  const load = async () => {
    setLoading(true);
    try {
      const [fams, campers] = await Promise.all([api.getFamilies(), api.getCampers()]);
      setFamilies(fams);
      setSingles(campers.filter((c) => !c.family_id));
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const saveFamily = async (data) => {
    if (modal?.family) {
      const updated = await api.updateFamily(modal.family._id, data);
      setFamilies((prev) => prev.map((f) =>
        f._id === updated._id ? { ...updated, members: f.members } : f
      ));
    } else {
      const created = await api.createFamily(data);
      setFamilies((prev) => [...prev, { ...created, members: [] }]);
    }
    setModal(null);
  };

  const deleteFamily = async (id, name) => {
    if (!confirm(`Delete "${name}"? Members will become singles.`)) return;
    await api.deleteFamily(id);
    setFamilies((prev) => prev.filter((f) => f._id !== id));
    if (expanded === id) setExpanded(null);
    load(); // reload singles — unlinked members appear there
  };

  const savePerson = async (data) => {
    if (modal?.person) {
      const updated = await api.updateCamper(modal.person._id, data);
      // Update in families list
      setFamilies((prev) => prev.map((f) => ({
        ...f,
        members: f.members?.map((m) => m._id === updated._id ? updated : m) || [],
      })));
      // Update in singles list
      setSingles((prev) => {
        if (!updated.family_id) {
          const exists = prev.find((s) => s._id === updated._id);
          return exists ? prev.map((s) => s._id === updated._id ? updated : s) : [...prev, updated];
        }
        return prev.filter((s) => s._id !== updated._id);
      });
    } else {
      await api.createCamper(data);
      load(); // full reload to get correct family/single placement
    }
    setModal(null);
  };

  const deletePerson = async (person, familyId) => {
    if (!confirm(`Remove ${person.first_name} ${person.last_name}?`)) return;
    await api.deleteCamper(person._id);
    if (familyId) {
      setFamilies((prev) => prev.map((f) =>
        f._id === familyId ? { ...f, members: f.members.filter((m) => m._id !== person._id) } : f
      ));
    } else {
      setSingles((prev) => prev.filter((s) => s._id !== person._id));
    }
  };

  const toggleInCamp = async (person, familyId) => {
    const updated = await api.toggleInCamp(person._id);
    if (familyId) {
      setFamilies((prev) => prev.map((f) =>
        f._id === familyId
          ? { ...f, members: f.members.map((m) => m._id === updated._id ? updated : m) }
          : f
      ));
    } else {
      setSingles((prev) => prev.map((s) => s._id === updated._id ? updated : s));
    }
  };

  const toggleCheckIn = async (person, familyId) => {
    const updated = await api.checkInCamper(person._id, { checked_in: !person.checked_in });
    if (familyId) {
      setFamilies((prev) => prev.map((f) =>
        f._id === familyId
          ? { ...f, members: f.members.map((m) => m._id === updated._id ? updated : m) }
          : f
      ));
    } else {
      setSingles((prev) => prev.map((s) => s._id === updated._id ? updated : s));
    }
  };

  const allMembers  = families.flatMap((f) => f.members || []);
  const totalPeople = allMembers.length + singles.length;
  const inCamp      = [...allMembers, ...singles].filter((p) => p.in_camp).length;
  const familyOpts  = families.map((f) => ({ _id: f._id, family_name: f.family_name }));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
      }}>
        <div>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.1em" }}>PEOPLE</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginLeft: 10 }}>
            {inCamp}/{totalPeople} in camp
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn onClick={() => setModal({ type: "addPerson" })} color="var(--text-secondary)">+ SINGLE</Btn>
          <Btn onClick={() => setModal({ type: "addFamily" })} color="var(--teal)">+ FAMILY</Btn>
        </div>
      </div>

      {/* Summary strip */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
        borderBottom: "1px solid var(--border)", background: "var(--border)", gap: 1, flexShrink: 0,
      }}>
        <Cell label="FAMILIES" value={families.length}  color="var(--teal)" />
        <Cell label="SINGLES"  value={singles.length}   color="var(--text-secondary)" />
        <Cell label="IN CAMP"  value={inCamp}           color={inCamp === totalPeople && totalPeople > 0 ? "var(--teal)" : "var(--amber)"} />
        <Cell label="OUT"      value={totalPeople - inCamp} color={totalPeople - inCamp > 0 ? "var(--red)" : "var(--text-muted)"} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
        {loading && <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)", fontSize: 12 }}>Loading…</div>}

        {/* Families */}
        {families.map((family) => (
          <FamilyCard
            key={family._id}
            family={family}
            trackerMap={trackerMap}
            expanded={expanded === family._id}
            onToggle={() => setExpanded(expanded === family._id ? null : family._id)}
            onEdit={() => setModal({ type: "editFamily", family })}
            onDelete={() => deleteFamily(family._id, family.family_name)}
            onAddMember={() => setModal({ type: "addPerson", familyId: family._id })}
            onEditMember={(p) => setModal({ type: "editPerson", person: p })}
            onDeleteMember={(p) => deletePerson(p, family._id)}
            onToggleInCamp={(p) => toggleInCamp(p, family._id)}
            onToggleCheckIn={(p) => toggleCheckIn(p, family._id)}
            onLocate={onSelectTracker}
          />
        ))}

        {/* Singles section */}
        {singles.length > 0 && (
          <div style={{ marginTop: families.length > 0 ? 8 : 0 }}>
            <div style={{
              fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)",
              letterSpacing: "0.08em", padding: "6px 8px 8px",
              borderTop: families.length > 0 ? "1px solid var(--border)" : "none",
            }}>
              INDIVIDUALS — {singles.length}
            </div>
            {singles.map((person) => (
              <MemberRow
                key={person._id}
                member={person}
                tracker={person.device_id ? trackerMap[person.device_id] : null}
                onLocate={() => person.device_id && onSelectTracker(person.device_id)}
                onEdit={() => setModal({ type: "editPerson", person })}
                onDelete={() => deletePerson(person, null)}
                onToggleInCamp={() => toggleInCamp(person, null)}
                onToggleCheckIn={() => toggleCheckIn(person, null)}
              />
            ))}
          </div>
        )}

        {!loading && families.length === 0 && singles.length === 0 && (
          <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)", fontSize: 12 }}>
            No people yet.<br />
            <span style={{ color: "var(--teal)", cursor: "pointer" }} onClick={() => setModal({ type: "addFamily" })}>+ Add family</span>
            {" · "}
            <span style={{ color: "var(--text-secondary)", cursor: "pointer" }} onClick={() => setModal({ type: "addPerson" })}>+ Add person</span>
            <br />or run <code style={{ fontSize: 11, color: "var(--teal)" }}>npm run seed</code>
          </div>
        )}
      </div>

      {/* Modals */}
      {(modal?.type === "addFamily" || modal?.type === "editFamily") && (
        <FamilyForm
          initial={modal.family || {}}
          title={modal.family ? "EDIT FAMILY" : "ADD FAMILY"}
          onSave={saveFamily}
          onClose={() => setModal(null)}
        />
      )}
      {(modal?.type === "addPerson" || modal?.type === "editPerson") && (
        <PersonForm
          initial={modal.person || (modal.familyId ? { family_id: modal.familyId } : {})}
          families={familyOpts}
          title={modal.person ? "EDIT PERSON" : "ADD PERSON"}
          onSave={savePerson}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function FamilyCard({ family, trackerMap, expanded, onToggle, onEdit, onDelete, onAddMember, onEditMember, onDeleteMember, onToggleInCamp, onToggleCheckIn, onLocate }) {
  const members     = family.members || [];
  const hasSos      = members.some((m) => m.device_id && trackerMap[m.device_id]?.sos);
  const outCount    = members.filter((m) => !m.in_camp).length;
  const onlineCount = members.filter((m) => m.device_id && trackerMap[m.device_id]).length;

  return (
    <div className="fade-in" style={{
      background: hasSos ? "var(--red-dim)" : "var(--bg-card)",
      border: `1px solid ${hasSos ? "var(--red)" : outCount > 0 ? "var(--amber)" : "var(--border)"}`,
      borderRadius: 8, marginBottom: 6, overflow: "hidden", transition: "all 0.2s",
    }}>
      <div onClick={onToggle} style={{ padding: "10px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, color: hasSos ? "var(--red)" : "var(--text-primary)" }}>
            {hasSos && "🚨 "}{family.family_name}
            {outCount > 0 && <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--amber)", marginLeft: 8 }}>{outCount} OUT</span>}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
            {family.cabin || "No cabin"} · {members.length} members · {onlineCount} tracked
          </div>
        </div>
        <IconBtn onClick={(e) => { e.stopPropagation(); onEdit(); }}>✏️</IconBtn>
        <IconBtn onClick={(e) => { e.stopPropagation(); onDelete(); }}>🗑️</IconBtn>
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "8px" }}>
          {members.length === 0 && (
            <div style={{ textAlign: "center", padding: 12, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>No members</div>
          )}
          {members.map((m) => (
            <MemberRow
              key={m._id}
              member={m}
              tracker={m.device_id ? trackerMap[m.device_id] : null}
              onLocate={() => onLocate(m.device_id)}
              onEdit={() => onEditMember(m)}
              onDelete={() => onDeleteMember(m)}
              onToggleInCamp={() => onToggleInCamp(m)}
              onToggleCheckIn={() => onToggleCheckIn(m)}
            />
          ))}
          <button onClick={onAddMember} style={{
            width: "100%", marginTop: 6, background: "transparent",
            border: "1px dashed var(--border)", color: "var(--text-muted)",
            borderRadius: 6, padding: "7px 0", fontFamily: "var(--font-mono)",
            fontSize: 11, cursor: "pointer",
          }}
            onMouseEnter={(e) => { e.target.style.borderColor = "var(--teal)"; e.target.style.color = "var(--teal)"; }}
            onMouseLeave={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.color = "var(--text-muted)"; }}
          >+ Add member</button>

          {family.emergency_contact_name && (
            <div style={{
              marginTop: 8, padding: "7px 10px", background: "var(--bg-base)",
              borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", lineHeight: 1.7,
            }}>
              <span style={{ color: "var(--text-secondary)" }}>Emergency: </span>
              {family.emergency_contact_name} · {family.emergency_contact_phone}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MemberRow({ member, tracker, onLocate, onEdit, onDelete, onToggleInCamp, onToggleCheckIn }) {
  const online      = !!tracker;
  const sos         = tracker?.sos;
  const outOfCamp   = !member.in_camp;
  const statusColor = sos ? "var(--red)" : outOfCamp ? "var(--text-muted)" : online ? "var(--teal)" : "var(--border)";
  const name        = `${member.first_name} ${member.last_name}`;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "7px 8px",
      borderRadius: 6, marginBottom: 4,
      background: sos ? "rgba(239,68,68,0.08)" : outOfCamp ? "rgba(0,0,0,0.1)" : "var(--bg-panel)",
      opacity: outOfCamp ? 0.7 : 1,
    }}>
      <Avatar name={name} color={statusColor} size={28} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 500, color: sos ? "var(--red)" : outOfCamp ? "var(--text-muted)" : "var(--text-primary)" }}>
          {sos && "🚨 "}{name}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>
          Age {member.age ?? "—"} · {member.role}
          {online && !outOfCamp && <span style={{ color: "var(--teal)" }}> · {tracker.battery_pct}%</span>}
          {!member.device_id && <span> · no device</span>}
          {outOfCamp && <span style={{ color: "var(--amber)" }}> · OUT OF CAMP</span>}
        </div>
      </div>

      {/* In camp toggle */}
      <button onClick={onToggleInCamp} title={member.in_camp ? "Mark as left camp" : "Mark as returned"} style={{
        background: member.in_camp ? "var(--teal-dim)" : "var(--amber-dim)",
        border: `1px solid ${member.in_camp ? "var(--teal)" : "var(--amber)"}`,
        color: member.in_camp ? "var(--teal)" : "var(--amber)",
        borderRadius: 4, padding: "2px 6px", fontSize: 9,
        fontFamily: "var(--font-mono)", cursor: "pointer", flexShrink: 0,
        fontWeight: 600,
      }}>
        {member.in_camp ? "IN CAMP" : "OUT"}
      </button>

      {online && member.in_camp && (
        <button onClick={onLocate} style={{
          background: "var(--teal-dim)", border: "1px solid var(--teal)",
          color: "var(--teal)", borderRadius: 4, padding: "2px 6px",
          fontSize: 11, cursor: "pointer", flexShrink: 0,
        }}>📍</button>
      )}

      <IconBtn onClick={onEdit}>✏️</IconBtn>
      <IconBtn onClick={onDelete}>🗑️</IconBtn>
    </div>
  );
}

function IconBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: "transparent", border: "none",
      color: "var(--text-muted)", cursor: "pointer",
      fontSize: 13, padding: "2px 3px", borderRadius: 4, flexShrink: 0,
    }}
      onMouseEnter={(e) => e.target.style.color = "var(--text-primary)"}
      onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
    >{children}</button>
  );
}

function Btn({ onClick, children, color }) {
  return (
    <button onClick={onClick} style={{
      background: "transparent", border: `1px solid ${color}`,
      color, borderRadius: 6, padding: "4px 10px",
      fontSize: 10, fontFamily: "var(--font-mono)", cursor: "pointer",
    }}>{children}</button>
  );
}

function Cell({ label, value, color }) {
  return (
    <div style={{ background: "var(--bg-panel)", padding: "8px 10px" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 600, color }}>{value}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", marginTop: 2, letterSpacing: "0.08em" }}>{label}</div>
    </div>
  );
}
