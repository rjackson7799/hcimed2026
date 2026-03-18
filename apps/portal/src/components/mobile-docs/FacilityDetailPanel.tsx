import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@hci/shared/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@hci/shared/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@hci/shared/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@hci/shared/ui/collapsible';
import { Button } from '@hci/shared/ui/button';
import { Input } from '@hci/shared/ui/input';
import { Label } from '@hci/shared/ui/label';
import { Textarea } from '@hci/shared/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hci/shared/ui/select';
import { Skeleton } from '@hci/shared/ui/skeleton';
import { cn } from '@hci/shared/lib/utils';
import {
  Phone,
  Mail,
  MapPin,
  Users,
  BedDouble,
  Pencil,
  Archive,
  ChevronDown,
  Plus,
  Pin,
  User,
  Search,
  Trash2,
  Star,
  BarChart3,
  TrendingUp,
  GitBranch,
} from 'lucide-react';
import {
  useFacility,
  useFacilityContacts,
  useFacilityNotes,
  useFacilityCensus,
  useArchiveFacility,
  useCreateContact,
  useCreateNote,
  useUpdateContact,
  useDeleteContact,
  useSetPrimaryContact,
  useToggleNotePin,
  useCreateCensus,
} from '@/hooks/useFacilities';
import {
  FACILITY_TYPE_COLORS,
  FACILITY_STATUS_DOT_COLORS,
  NOTE_TYPE_COLORS,
} from '@/lib/mobile-docs-constants';
import type { FacilityContact, FacilityCensus } from '@/types/mobile-docs';
import type { ContactFormData, NoteFormData, CensusFormData } from '@/schemas/facilitySchema';
import { EditFacilityForm } from './EditFacilityForm';
import { FacilityCensusTrendChart } from './FacilityCensusTrendChart';
import { PenetrationTrendChart } from './PenetrationTrendChart';
import { EnrollmentBreakdownCard } from './EnrollmentBreakdownCard';
import { PipelineHistoryTimeline } from './PipelineHistoryTimeline';
import { ChangeStatusDialog } from './ChangeStatusDialog';

interface FacilityDetailPanelProps {
  facilityId: string | null;
  onClose: () => void;
}

const CONTACT_ROLES = ['DON', 'Administrator', 'Owner', 'Discharge Planner', 'Social Worker', 'Caregiver', 'MA Plan Coordinator', 'Other'] as const;
const CONTACT_TYPES = ['Administrative', 'Clinical', 'Caregiver', 'Referral'] as const;
const NOTE_TYPES = ['General', 'Visit Summary', 'Outreach', 'Partnership', 'Clinical', 'Administrative'] as const;

export function FacilityDetailPanel({ facilityId, onClose }: FacilityDetailPanelProps) {
  const { data: facility, isLoading } = useFacility(facilityId);
  const { data: contacts } = useFacilityContacts(facilityId);
  const { data: notes } = useFacilityNotes(facilityId);
  const { data: census } = useFacilityCensus(facilityId);
  const archiveMutation = useArchiveFacility();
  const deleteMutation = useDeleteContact();
  const setPrimaryMutation = useSetPrimaryContact();
  const togglePinMutation = useToggleNotePin();

  const [editOpen, setEditOpen] = useState(false);
  const [contactsExpanded, setContactsExpanded] = useState(false);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<FacilityContact | null>(null);
  const [contactSearch, setContactSearch] = useState('');
  const [noteTypeFilter, setNoteTypeFilter] = useState('All');
  const [censusOpen, setCensusOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [trendsExpanded, setTrendsExpanded] = useState(false);
  const [pipelineExpanded, setPipelineExpanded] = useState(true);

  const primaryContact = contacts?.find((c) => c.is_primary);
  const otherContacts = contacts?.filter((c) => !c.is_primary) ?? [];

  // Contact search filtering
  const searchLower = contactSearch.toLowerCase();
  const matchesSearch = (c: FacilityContact) =>
    !contactSearch ||
    c.name.toLowerCase().includes(searchLower) ||
    c.role.toLowerCase().includes(searchLower) ||
    c.phone?.toLowerCase().includes(searchLower) ||
    c.email?.toLowerCase().includes(searchLower);

  const showPrimary = primaryContact && matchesSearch(primaryContact);
  const filteredOtherContacts = contactSearch
    ? otherContacts.filter(matchesSearch)
    : otherContacts;

  // Note type filtering
  const filteredNotes = notes
    ? noteTypeFilter === 'All'
      ? notes
      : notes.filter((n) => n.note_type === noteTypeFilter)
    : [];

  const penetration =
    facility && facility.total_beds && census
      ? ((census.active_patients / facility.total_beds) * 100).toFixed(1)
      : null;

  const handleEditContact = (contact: FacilityContact) => {
    setEditingContact(contact);
    setEditContactOpen(true);
  };

  const handleDeleteContact = (contact: FacilityContact) => {
    if (!facilityId) return;
    deleteMutation.mutate({ contactId: contact.id, facilityId });
  };

  const handleMakePrimary = (contact: FacilityContact) => {
    if (!facilityId) return;
    setPrimaryMutation.mutate({ facilityId, contactId: contact.id });
  };

  const handleTogglePin = (noteId: string) => {
    if (!facilityId) return;
    togglePinMutation.mutate({ noteId, facilityId });
  };

  return (
    <>
      <Sheet open={!!facilityId} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="sm:max-w-[520px] overflow-y-auto">
          {isLoading || !facility ? (
            <div className="space-y-4 pt-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="space-y-6 pt-2">
              {/* Header */}
              <SheetHeader>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: FACILITY_TYPE_COLORS[facility.type].bg,
                      color: FACILITY_TYPE_COLORS[facility.type].text,
                    }}
                  >
                    {facility.type}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className={cn('h-2 w-2 rounded-full', FACILITY_STATUS_DOT_COLORS[facility.status])} />
                    {facility.status}
                  </span>
                </div>
                <SheetTitle className="text-xl">{facility.name}</SheetTitle>
                <SheetDescription className="text-sm">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {facility.address_line1}
                    {facility.address_line2 ? `, ${facility.address_line2}` : ''}, {facility.city},{' '}
                    {facility.state} {facility.zip}
                  </span>
                  {facility.phone && (
                    <a href={`tel:${facility.phone}`} className="flex items-center gap-1.5 mt-1 hover:text-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {facility.phone}
                    </a>
                  )}
                </SheetDescription>
              </SheetHeader>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Archive className="h-3.5 w-3.5 mr-1.5" />
                      Archive
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Archive facility?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {facility.name} will be hidden from default views but all data will be preserved.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          archiveMutation.mutate(facility.id);
                          onClose();
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Archive
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Metrics grid */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <MetricItem icon={Users} label="Patients" value={census?.active_patients ?? '—'} />
                  <MetricItem
                    icon={BedDouble}
                    label="Beds"
                    value={facility.type === 'Homebound' ? 'N/A' : (facility.total_beds ?? '—')}
                  />
                  <MetricItem label="Penetration" value={penetration ? `${penetration}%` : '—'} />
                  <MetricItem
                    icon={MapPin}
                    label="Distance"
                    value={facility.distance_miles != null ? `${facility.distance_miles} mi` : '—'}
                  />
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setCensusOpen(true)}>
                    <BarChart3 className="h-3.5 w-3.5 mr-1" />
                    Update Census
                  </Button>
                </div>
              </div>

              {/* Provider & Cadence */}
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="font-medium">
                    {facility.assigned_provider_id || 'Unassigned'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cadence</span>
                  <span className="font-medium">{facility.visit_cadence}</span>
                </div>
              </div>

              {/* Census Trends */}
              <Collapsible open={trendsExpanded} onOpenChange={setTrendsExpanded}>
                <CollapsibleTrigger className="flex w-full items-center justify-between py-1">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                    <h4 className="text-sm font-semibold">Census Trends</h4>
                  </div>
                  <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', trendsExpanded && 'rotate-180')} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-2">
                  <FacilityCensusTrendChart facilityId={facility.id} />
                  {facility.type !== 'Homebound' && facility.total_beds != null && (
                    <PenetrationTrendChart facilityId={facility.id} totalBeds={facility.total_beds} />
                  )}
                  {census && <EnrollmentBreakdownCard census={census} />}
                </CollapsibleContent>
              </Collapsible>

              {/* Contacts section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Contacts</h4>
                  <Button variant="ghost" size="sm" onClick={() => setAddContactOpen(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                </div>

                {(contacts?.length ?? 0) > 2 && (
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search contacts..."
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                      className="pl-8 h-8 text-xs"
                    />
                  </div>
                )}

                {showPrimary && (
                  <ContactCard
                    contact={primaryContact}
                    isPrimary
                    onEdit={handleEditContact}
                    onDelete={handleDeleteContact}
                    onMakePrimary={handleMakePrimary}
                  />
                )}

                {filteredOtherContacts.length > 0 && (
                  <Collapsible open={contactsExpanded || !!contactSearch} onOpenChange={setContactsExpanded}>
                    {!contactSearch && (
                      <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                        <ChevronDown
                          className={cn('h-3.5 w-3.5 transition-transform', contactsExpanded && 'rotate-180')}
                        />
                        {filteredOtherContacts.length} more contact{filteredOtherContacts.length > 1 ? 's' : ''}
                      </CollapsibleTrigger>
                    )}
                    <CollapsibleContent className="space-y-2 mt-2">
                      {filteredOtherContacts.map((c) => (
                        <ContactCard
                          key={c.id}
                          contact={c}
                          onEdit={handleEditContact}
                          onDelete={handleDeleteContact}
                          onMakePrimary={handleMakePrimary}
                        />
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {contactSearch && !showPrimary && filteredOtherContacts.length === 0 && (
                  <p className="text-xs text-muted-foreground">No contacts match your search.</p>
                )}
              </div>

              {/* Notes timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold">Notes</h4>
                    {notes && notes.length > 0 && (
                      <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-medium">
                        {notes.length}
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setAddNoteOpen(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                </div>

                {notes && notes.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {['All', ...NOTE_TYPES].map((t) => (
                      <button
                        key={t}
                        onClick={() => setNoteTypeFilter(t)}
                        className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full border transition-colors',
                          noteTypeFilter === t
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-transparent text-muted-foreground border-border hover:border-foreground/30'
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}

                {filteredNotes.length > 0 ? (
                  <div className="space-y-3">
                    {filteredNotes.map((note) => (
                      <div key={note.id} className="rounded-lg border p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'text-[10px] font-medium px-1.5 py-0.5 rounded',
                                NOTE_TYPE_COLORS[note.note_type] || 'bg-slate-600 text-slate-200'
                              )}
                            >
                              {note.note_type}
                            </span>
                            <button
                              onClick={() => handleTogglePin(note.id)}
                              className={cn(
                                'hover:text-amber-300 transition-colors',
                                note.is_pinned ? 'text-amber-400' : 'text-muted-foreground/40 hover:text-muted-foreground'
                              )}
                              title={note.is_pinned ? 'Unpin' : 'Pin'}
                            >
                              <Pin className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeDate(note.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{note.author_name}</p>
                        <NoteContent content={note.content} />
                      </div>
                    ))}
                  </div>
                ) : notes && notes.length > 0 ? (
                  <p className="text-sm text-muted-foreground">No notes match this filter.</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No notes yet.</p>
                )}
              </div>

              {/* Pipeline History */}
              <Collapsible open={pipelineExpanded} onOpenChange={setPipelineExpanded}>
                <div className="flex items-center justify-between">
                  <CollapsibleTrigger className="flex items-center gap-1.5 py-1">
                    <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                    <h4 className="text-sm font-semibold">Pipeline History</h4>
                    <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', pipelineExpanded && 'rotate-180')} />
                  </CollapsibleTrigger>
                  <Button variant="ghost" size="sm" onClick={() => setStatusDialogOpen(true)}>
                    Change Status
                  </Button>
                </div>
                <CollapsibleContent className="pt-2">
                  <PipelineHistoryTimeline facilityId={facility.id} />
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit facility dialog */}
      {facility && (
        <EditFacilityForm facility={facility} open={editOpen} onOpenChange={setEditOpen} />
      )}

      {/* Add Contact dialog */}
      <AddContactDialog
        open={addContactOpen}
        onOpenChange={setAddContactOpen}
        facilityId={facilityId}
      />

      {/* Edit Contact dialog */}
      <EditContactDialog
        open={editContactOpen}
        onOpenChange={setEditContactOpen}
        facilityId={facilityId}
        contact={editingContact}
      />

      {/* Add Note dialog */}
      <AddNoteDialog
        open={addNoteOpen}
        onOpenChange={setAddNoteOpen}
        facilityId={facilityId}
      />

      {/* Census update dialog */}
      <CensusDialog
        open={censusOpen}
        onOpenChange={setCensusOpen}
        facilityId={facilityId}
        currentCensus={census ?? null}
      />

      {/* Change Status dialog */}
      {facility && (
        <ChangeStatusDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          facilityId={facility.id}
          facilityName={facility.name}
          currentStatus={facility.status}
        />
      )}
    </>
  );
}

// ─── Sub-components ────────────────────────────────────────────────

function MetricItem({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function ContactCard({
  contact,
  isPrimary,
  onEdit,
  onDelete,
  onMakePrimary,
}: {
  contact: FacilityContact;
  isPrimary?: boolean;
  onEdit: (contact: FacilityContact) => void;
  onDelete: (contact: FacilityContact) => void;
  onMakePrimary: (contact: FacilityContact) => void;
}) {
  return (
    <div className="rounded-lg border p-3 space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{contact.name}</span>
          {isPrimary && (
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Primary</span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          {!isPrimary && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              title="Make Primary"
              onClick={() => onMakePrimary(contact)}
            >
              <Star className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="Edit"
            onClick={() => onEdit(contact)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          {isPrimary ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground/30 cursor-not-allowed"
              title="Reassign primary first"
              disabled
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete contact?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Remove {contact.name} from this facility. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(contact)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {contact.role} · {contact.contact_type}
      </p>
      {contact.phone && (
        <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Phone className="h-3 w-3" /> {contact.phone}
        </a>
      )}
      {contact.email && (
        <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Mail className="h-3 w-3" /> {contact.email}
        </a>
      )}
    </div>
  );
}

function NoteContent({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const needsExpand = content.length > 200;

  return (
    <div>
      <p className={cn('text-sm leading-relaxed', !expanded && needsExpand && 'line-clamp-3')}>
        {content}
      </p>
      {needsExpand && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary hover:underline mt-0.5"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}

function AddContactDialog({
  open,
  onOpenChange,
  facilityId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: string | null;
}) {
  const createContact = useCreateContact();
  const [form, setForm] = useState<ContactFormData>({
    name: '',
    role: 'Administrator',
    contact_type: 'Administrative',
    phone: '',
    email: '',
  });

  const handleSubmit = async () => {
    if (!facilityId || !form.name) return;
    await createContact.mutateAsync({ facilityId, data: form });
    setForm({ name: '', role: 'Administrator', contact_type: 'Administrative', phone: '', email: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Contact</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Contact name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as ContactFormData['role'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CONTACT_ROLES.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={form.contact_type} onValueChange={(v) => setForm({ ...form, contact_type: v as ContactFormData['contact_type'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CONTACT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!form.name || createContact.isPending}>
            Add Contact
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditContactDialog({
  open,
  onOpenChange,
  facilityId,
  contact,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: string | null;
  contact: FacilityContact | null;
}) {
  const updateContact = useUpdateContact();
  const [form, setForm] = useState<ContactFormData>({
    name: '',
    role: 'Administrator',
    contact_type: 'Administrative',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (contact) {
      setForm({
        name: contact.name,
        role: contact.role,
        contact_type: contact.contact_type,
        phone: contact.phone ?? '',
        email: contact.email ?? '',
      });
    }
  }, [contact]);

  const handleSubmit = async () => {
    if (!facilityId || !contact || !form.name) return;
    await updateContact.mutateAsync({ contactId: contact.id, facilityId, data: form });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Contact name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as ContactFormData['role'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CONTACT_ROLES.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={form.contact_type} onValueChange={(v) => setForm({ ...form, contact_type: v as ContactFormData['contact_type'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CONTACT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!form.name || updateContact.isPending}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddNoteDialog({
  open,
  onOpenChange,
  facilityId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: string | null;
}) {
  const createNote = useCreateNote();
  const [form, setForm] = useState<NoteFormData>({
    note_type: 'General',
    content: '',
  });

  const handleSubmit = async () => {
    if (!facilityId || !form.content) return;
    await createNote.mutateAsync({ facilityId, data: form });
    setForm({ note_type: 'General', content: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Select value={form.note_type} onValueChange={(v) => setForm({ ...form, note_type: v as NoteFormData['note_type'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {NOTE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Write your note..."
            rows={4}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!form.content || createNote.isPending}>
            Add Note
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CensusDialog({
  open,
  onOpenChange,
  facilityId,
  currentCensus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: string | null;
  currentCensus: FacilityCensus | null;
}) {
  const createCensus = useCreateCensus();
  const [form, setForm] = useState<CensusFormData>({
    active_patients: 0,
    new_admissions: 0,
    discharges: 0,
    ccm_enrolled: 0,
    rpm_enrolled: 0,
    awv_eligible: 0,
  });

  useEffect(() => {
    if (open && currentCensus) {
      setForm({
        active_patients: currentCensus.active_patients,
        new_admissions: currentCensus.new_admissions,
        discharges: currentCensus.discharges,
        ccm_enrolled: currentCensus.ccm_enrolled,
        rpm_enrolled: currentCensus.rpm_enrolled,
        awv_eligible: currentCensus.awv_eligible,
      });
    } else if (open && !currentCensus) {
      setForm({ active_patients: 0, new_admissions: 0, discharges: 0, ccm_enrolled: 0, rpm_enrolled: 0, awv_eligible: 0 });
    }
  }, [open, currentCensus]);

  const handleSubmit = async () => {
    if (!facilityId) return;
    await createCensus.mutateAsync({ facilityId, data: form });
    onOpenChange(false);
  };

  const setField = (field: keyof CensusFormData, value: string) => {
    setForm({ ...form, [field]: value === '' ? 0 : parseInt(value, 10) || 0 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Census</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Active Patients *</Label>
            <Input
              type="number"
              min={0}
              value={form.active_patients}
              onChange={(e) => setField('active_patients', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">New Admissions</Label>
              <Input
                type="number"
                min={0}
                value={form.new_admissions}
                onChange={(e) => setField('new_admissions', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Discharges</Label>
              <Input
                type="number"
                min={0}
                value={form.discharges}
                onChange={(e) => setField('discharges', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">CCM Enrolled</Label>
              <Input
                type="number"
                min={0}
                value={form.ccm_enrolled}
                onChange={(e) => setField('ccm_enrolled', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">RPM Enrolled</Label>
              <Input
                type="number"
                min={0}
                value={form.rpm_enrolled}
                onChange={(e) => setField('rpm_enrolled', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">AWV Eligible</Label>
              <Input
                type="number"
                min={0}
                value={form.awv_eligible}
                onChange={(e) => setField('awv_eligible', e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createCensus.isPending}>
            Save Census
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
