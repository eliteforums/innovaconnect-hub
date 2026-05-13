import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Save, Github, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFinalistContext } from "./FinalistLayout";
import {
  fetchTeamMembers,
  updateTeamProfile,
  type TeamMember,
} from "@/lib/hms";
import { emailSchema, phoneSchema, githubUrlSchema } from "@/lib/hmsValidation";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MemberFormState {
  email: string;
  phone: string;
  role: string;
}

interface MemberErrors {
  email?: string;
  phone?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const FinalistProfile = () => {
  const { team } = useFinalistContext();
  const queryClient = useQueryClient();

  const [githubUrl, setGithubUrl] = useState(team?.github_url ?? "");
  const [githubError, setGithubError] = useState<string | null>(null);
  const [memberForms, setMemberForms] = useState<Record<string, MemberFormState>>({});
  const [memberErrors, setMemberErrors] = useState<Record<string, MemberErrors>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch team members
  const { data: members, isLoading } = useQuery({
    queryKey: ["finalist-members", team?.id],
    queryFn: async () => {
      if (!team) return [];
      const { data } = await fetchTeamMembers(team.id);
      return data ?? [];
    },
    enabled: !!team,
    onSuccess: (data: TeamMember[]) => {
      // Initialize form state from fetched data
      const forms: Record<string, MemberFormState> = {};
      data.forEach((m) => {
        forms[m.id] = { email: m.email, phone: m.phone, role: m.role };
      });
      setMemberForms(forms);
    },
  });

  // Initialize member forms when data loads (for cases where onSuccess doesn't fire)
  if (members && Object.keys(memberForms).length === 0 && members.length > 0) {
    const forms: Record<string, MemberFormState> = {};
    members.forEach((m) => {
      forms[m.id] = { email: m.email, phone: m.phone, role: m.role };
    });
    setMemberForms(forms);
  }

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!team) throw new Error("No team");

      // Validate GitHub URL if provided
      if (githubUrl.trim()) {
        const result = githubUrlSchema.safeParse(githubUrl.trim());
        if (!result.success) {
          setGithubError(result.error.errors[0].message);
          throw new Error("Validation failed");
        }
      }
      setGithubError(null);

      // Validate all member fields
      const errors: Record<string, MemberErrors> = {};
      let hasErrors = false;

      Object.entries(memberForms).forEach(([memberId, form]) => {
        const memberErr: MemberErrors = {};

        const emailResult = emailSchema.safeParse(form.email);
        if (!emailResult.success) {
          memberErr.email = emailResult.error.errors[0].message;
          hasErrors = true;
        }

        const phoneResult = phoneSchema.safeParse(form.phone);
        if (!phoneResult.success) {
          memberErr.phone = phoneResult.error.errors[0].message;
          hasErrors = true;
        }

        if (Object.keys(memberErr).length > 0) {
          errors[memberId] = memberErr;
        }
      });

      setMemberErrors(errors);
      if (hasErrors) throw new Error("Validation failed");

      // Update team github_url
      const { error: teamError } = await updateTeamProfile(team.id, {
        github_url: githubUrl.trim() || null,
      });
      if (teamError) throw new Error(teamError.message);

      // Update each member
      for (const [memberId, form] of Object.entries(memberForms)) {
        const { error: memberError } = await supabase
          .from("team_members")
          .update({
            email: form.email,
            phone: form.phone,
            role: form.role,
          })
          .eq("id", memberId);
        if (memberError) throw new Error(memberError.message);
      }
    },
    onSuccess: () => {
      setSaveSuccess(true);
      setSaveError(null);
      queryClient.invalidateQueries({ queryKey: ["finalist-members"] });
      setTimeout(() => setSaveSuccess(false), 3000);
    },
    onError: (err: Error) => {
      if (err.message !== "Validation failed") {
        setSaveError(err.message);
      }
    },
  });

  const updateMemberField = (
    memberId: string,
    field: keyof MemberFormState,
    value: string,
  ) => {
    setMemberForms((prev) => ({
      ...prev,
      [memberId]: { ...prev[memberId], [field]: value },
    }));
    // Clear error for this field
    setMemberErrors((prev) => ({
      ...prev,
      [memberId]: { ...prev[memberId], [field]: undefined },
    }));
  };

  if (!team) return null;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-editorial-pink flex items-center justify-center">
          <User size={16} className="text-background" />
        </div>
        <div>
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground">
            TEAM
          </p>
          <h1 className="text-xl font-black uppercase tracking-tight">
            PROFILE
          </h1>
        </div>
      </div>

      {/* Read-only team info */}
      <div className="border-2 border-foreground p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
          TEAM INFORMATION
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Team Name
            </p>
            <p className="text-sm font-bold">{team.team_name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Team ID
            </p>
            <p className="text-sm font-bold">{team.team_id}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Domain
            </p>
            <p className="text-sm font-bold">{team.domain}</p>
          </div>
        </div>
      </div>

      {/* GitHub URL */}
      <div className="border-2 border-foreground p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
          REPOSITORY
        </p>
        <div>
          <Label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Github size={14} /> GitHub Repository URL
          </Label>
          <Input
            type="url"
            value={githubUrl}
            onChange={(e) => {
              setGithubUrl(e.target.value);
              setGithubError(null);
            }}
            placeholder="https://github.com/username/repository"
            className="mt-1 bg-secondary border-border"
          />
          {githubError && (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle size={12} /> {githubError}
            </p>
          )}
        </div>
      </div>

      {/* Team members */}
      <div className="border-2 border-foreground p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
          TEAM MEMBERS
        </p>

        {isLoading ? (
          <p className="text-xs text-muted-foreground">Loading members...</p>
        ) : !members || members.length === 0 ? (
          <p className="text-xs text-muted-foreground">No team members found.</p>
        ) : (
          <div className="space-y-6">
            {members.map((member) => (
              <div
                key={member.id}
                className="border border-border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">{member.member_name}</p>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary px-2 py-0.5">
                    {memberForms[member.id]?.role || member.role}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Email */}
                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Email
                    </Label>
                    <Input
                      type="email"
                      value={memberForms[member.id]?.email ?? member.email}
                      onChange={(e) =>
                        updateMemberField(member.id, "email", e.target.value)
                      }
                      className="mt-0.5 bg-secondary border-border text-xs h-8"
                    />
                    {memberErrors[member.id]?.email && (
                      <p className="text-[10px] text-red-400 mt-0.5 flex items-center gap-1">
                        <AlertCircle size={10} /> {memberErrors[member.id].email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Phone
                    </Label>
                    <Input
                      type="tel"
                      value={memberForms[member.id]?.phone ?? member.phone}
                      onChange={(e) =>
                        updateMemberField(member.id, "phone", e.target.value)
                      }
                      className="mt-0.5 bg-secondary border-border text-xs h-8"
                    />
                    {memberErrors[member.id]?.phone && (
                      <p className="text-[10px] text-red-400 mt-0.5 flex items-center gap-1">
                        <AlertCircle size={10} /> {memberErrors[member.id].phone}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Role
                    </Label>
                    <Input
                      type="text"
                      value={memberForms[member.id]?.role ?? member.role}
                      onChange={(e) =>
                        updateMemberField(member.id, "role", e.target.value)
                      }
                      className="mt-0.5 bg-secondary border-border text-xs h-8"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 bg-editorial-pink px-6 py-2.5 text-xs font-black uppercase tracking-wider text-background hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={14} />
          {saveMutation.isPending ? "SAVING..." : "SAVE CHANGES"}
        </button>

        {saveSuccess && (
          <span className="text-xs text-green-400 font-bold uppercase tracking-wider">
            Changes saved successfully
          </span>
        )}
        {saveError && (
          <span className="text-xs text-red-400 font-bold flex items-center gap-1">
            <AlertCircle size={12} /> {saveError}
          </span>
        )}
      </div>
    </div>
  );
};

export default FinalistProfile;
