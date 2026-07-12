import { useState, useEffect } from 'react'
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, Box, IconButton, Tooltip, Skeleton, Menu, MenuItem, alpha } from '@mui/material'
import { Home, Stairs, Roofing, ChevronLeft, Menu as MenuIcon, Layers, Add, MoreVert, Edit, Delete } from '@mui/icons-material'
import useFloorList from '../hooks/useFloorList'
import { addFloor, updateFloor, deleteFloor } from '../firebase/deviceService'
import AddFloorDialog from './AddFloorDialog'
import ConfirmDialog from './ConfirmDialog'

const C = { gold: '#C9A84C', navy: '#1E3A5F', champagne: '#E8D5A3', platinum: '#C4B5D0', muted: '#7C6B8A', dark: '#0A1628', emerald: '#0D9488' }
const iconMap = { home: Home, stairs: Stairs, attic: Roofing, apartment: Home, villa: Home, office: Home }
const DW = 252, CW = 60

export default function Sidebar({ selectedFloorId, onFloorSelect }) {
  const [collapsed, setCollapsed] = useState(false); const [mounted, setMounted] = useState(false)
  const [addOpen, setAddOpen] = useState(false); const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState(null); const [delOpen, setDelOpen] = useState(false)
  const [delId, setDelId] = useState(null); const [menuA, setMenuA] = useState(null); const [menuF, setMenuF] = useState(null)
  const { floors, loading } = useFloorList()
  useEffect(() => { requestAnimationFrame(() => setMounted(true)) }, [])
  const si = floors.findIndex((f) => f.id === selectedFloorId)

  const handleAdd = async (d) => { await addFloor(d.name, d.icon) }
  const handleEdit = async (d) => { await updateFloor(editing.id, d); setEditing(null) }
  const handleDel = async () => { if (delId) { await deleteFloor(delId); if (selectedFloorId === delId) onFloorSelect(null); setDelId(null) } }

  return (<>
    <Drawer variant="permanent" sx={{ width: collapsed ? CW : DW, flexShrink: 0, transition: 'width 0.35s cubic-bezier(0.22,0.61,0.36,1)', '& .MuiDrawer-paper': { width: collapsed ? CW : DW, boxSizing: 'border-box', pt: 9, overflowX: 'hidden', transition: 'width 0.35s cubic-bezier(0.22,0.61,0.36,1)' } }}>
      <Box sx={{ display: 'flex', justifyContent: collapsed ? 'center' : 'space-between', alignItems: 'center', px: collapsed ? 0 : 2.5, pt: 2, pb: 0 }}>
        {!collapsed && <Typography variant="caption" sx={{ fontSize: '0.62rem', letterSpacing: '0.14em', color: C.muted, fontWeight: 600 }}>Floors</Typography>}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {!collapsed && <Tooltip title="Add Floor"><IconButton size="small" onClick={() => setAddOpen(true)} sx={{ color: C.muted, width: 28, height: 28, '&:hover': { color: C.gold, bgcolor: alpha(C.gold, 0.06) } }}><Add sx={{ fontSize: 18 }} /></IconButton></Tooltip>}
          <Tooltip title={collapsed ? 'Expand' : 'Collapse'} placement="right"><IconButton onClick={() => setCollapsed((c) => !c)} size="small" sx={{ color: C.muted, width: 28, height: 28, '&:hover': { color: C.gold, bgcolor: alpha(C.gold, 0.06) } }}>{collapsed ? <MenuIcon sx={{ fontSize: 16 }} /> : <ChevronLeft sx={{ fontSize: 16 }} />}</IconButton></Tooltip>
        </Box>
      </Box>
      <Box sx={{ position: 'relative', px: collapsed ? 0.8 : 1.5, pt: 1.5 }}>
        {!collapsed && si >= 0 && <Box sx={{ position: 'absolute', left: 6, width: 3, height: 24, borderRadius: 3, background: `linear-gradient(180deg, ${C.gold}, ${C.navy})`, top: si * 50 + 22, transition: 'top 0.45s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: '0 0 12px rgba(201,168,76,0.4)' }} />}
        {loading ? <Box sx={{ px: collapsed ? 0.5 : 1.5 }}>{[0,1,2].map((i)=><Skeleton key={i} variant="rounded" height={42} sx={{ mb: 0.5, borderRadius: 2.5 }} />)}</Box> : (
          <List sx={{ p: 0 }}>
            {floors.map((floor, idx) => {
              const Icon = iconMap[floor.icon] || Home; const sel = selectedFloorId === floor.id
              return (<Tooltip key={floor.id} title={collapsed ? floor.name : ''} placement="right" arrow>
                <ListItemButton selected={sel} onClick={() => onFloorSelect(floor.id)} disableRipple sx={{ borderRadius: 2.5, mb: 0.5, py: collapsed ? 1.1 : 0.9, px: collapsed ? 1 : 1.5, justifyContent: collapsed ? 'center' : 'flex-start', minHeight: 42, opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(-10px)', transition: `all 0.4s ease ${idx*0.05}s`, border: '1px solid transparent', position: 'relative', ...(sel ? { background: `linear-gradient(135deg, ${alpha(C.navy, 0.12)}, ${alpha(C.navy, 0.04)})`, borderColor: alpha(C.navy, 0.15), '&:hover': { background: `linear-gradient(135deg, ${alpha(C.navy, 0.18)}, ${alpha(C.navy, 0.06)})` } } : { '&:hover': { background: alpha(C.navy, 0.04), borderColor: alpha(C.navy, 0.06) } }) }}>
                  <ListItemIcon sx={{ minWidth: collapsed ? 0 : 34, color: sel ? C.gold : C.muted, transition: 'all 0.3s ease', justifyContent: 'center' }}><Icon sx={{ fontSize: collapsed ? 20 : 18 }} /></ListItemIcon>
                  {!collapsed && (<>
                    <ListItemText primary={floor.name} primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: sel?600:400, color: sel?C.champagne:C.platinum }} sx={{ my: 0 }} />
                    <Box sx={{ minWidth: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: sel ? alpha(C.gold, 0.12) : alpha(C.muted, 0.08), transition: 'all 0.3s ease' }}>
                      <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 700, color: sel ? C.gold : C.muted, lineHeight: 1, textTransform: 'none', letterSpacing: 0 }}>{floor.devices}</Typography>
                    </Box>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuA(e.currentTarget); setMenuF(floor.id) }} sx={{ ml: 0.5, color: sel?C.muted:C.muted, opacity: 0, transition: 'opacity 0.2s ease', '&:hover': { color: C.gold }, '.MuiListItemButton-root:hover &': { opacity: 1 } }}><MoreVert sx={{ fontSize: 16 }} /></IconButton>
                  </>)}
                </ListItemButton>
              </Tooltip>)
            })}
          </List>
        )}
      </Box>
      {!collapsed && (
        <Box sx={{ px: 2, pt: 3, pb: 2, mt: 'auto' }}>
          <Box sx={{ p: 2, borderRadius: 3, background: `linear-gradient(135deg, ${alpha(C.navy, 0.06)}, ${alpha(C.navy, 0.02)})`, border: `1px solid ${alpha(C.gold, 0.06)}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}><Layers sx={{ fontSize: 14, color: C.muted }} /><Typography variant="caption" sx={{ color: C.muted, fontSize: '0.62rem', letterSpacing: '0.1em', fontWeight: 600, textTransform: 'none' }}>Simulator Status</Typography></Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {[{ label: 'Floors', value: floors.length }, { label: 'Devices', value: floors.reduce((s,f)=>s+(f.devices||0),0) }].map((s)=>(
                <Box key={s.label}><Typography sx={{ fontFamily:'"Outfit", sans-serif', fontSize: '0.95rem', fontWeight: 600, color: C.champagne, lineHeight: 1.1 }}>{loading?'-':s.value}</Typography><Typography variant="caption" sx={{ fontSize: '0.58rem', color: C.muted, textTransform: 'none', letterSpacing: 0 }}>{s.label}</Typography></Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </Drawer>

    <Menu anchorEl={menuA} open={!!menuA} onClose={()=>{setMenuA(null);setMenuF(null)}} PaperProps={{ sx: { mt: 0.5, minWidth: 160, background: 'linear-gradient(160deg, #1A0A2E, #241040)', border: '1px solid rgba(201,168,76,0.08)', borderRadius: 3, boxShadow: '0 12px 40px rgba(0,0,0,0.6)', backgroundImage: 'none' } }}>
      <MenuItem onClick={()=>{setMenuA(null);setMenuF(null);const f=floors.find(x=>x.id===menuF);setEditing(f);setEditOpen(true)}} sx={{ mx: 1, my: 0.3, borderRadius: 2, color: C.platinum, gap: 1.5, '&:hover': { bgcolor: alpha(C.navy, 0.08), color: C.gold } }}><Edit sx={{ fontSize: 16 }} /><Typography sx={{ fontSize: '0.8rem' }}>Edit Floor</Typography></MenuItem>
      <MenuItem onClick={()=>{setMenuA(null);setMenuF(null);setDelId(menuF);setDelOpen(true)}} sx={{ mx: 1, my: 0.3, borderRadius: 2, color: '#BE123C', gap: 1.5, '&:hover': { bgcolor: alpha('#BE123C', 0.08) } }}><Delete sx={{ fontSize: 16 }} /><Typography sx={{ fontSize: '0.8rem' }}>Delete Floor</Typography></MenuItem>
    </Menu>

    <AddFloorDialog open={addOpen} onClose={()=>setAddOpen(false)} onSave={handleAdd} />
    <AddFloorDialog open={editOpen} onClose={()=>{setEditOpen(false);setEditing(null)}} onSave={handleEdit} initialData={editing} />
    <ConfirmDialog open={delOpen} onClose={()=>{setDelOpen(false);setDelId(null)}} onConfirm={handleDel} title="Delete Floor" message="This will permanently delete this floor and all its rooms and devices." confirmLabel="Delete Floor" />
  </>)
}
