// Publish the current Studio design to the community template gallery.
import { useState } from "react";
import { Loader2, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { useStudio } from "@/lib/studio/store";
import { publishTemplate, type TemplateAudience } from "@/lib/templates";
import { audienceLabel } from "@/components/CommunityTemplates";
import { tx, txErr } from "@/lib/tx";

export function PublishTemplateDialog({ ar, defaultTitle }: { ar: boolean; defaultTitle?: string }) {
  const { state } = useStudio();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(defaultTitle || "");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [audience, setAudience] = useState<TemplateAudience>("mixed");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!title.trim()) {
      toast.error(tx("Give the template a name"));
      return;
    }
    setBusy(true);
    try {
      await publishTemplate({
        title,
        description,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8),
        design: state.doc,
        isPublic,
        audience,
      });
      toast.success(
        isPublic
          ? tx("Template published")
          : tx("Template saved privately"),
      );
      setOpen(false);
    } catch (e) {
      toast.error(txErr(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs hover:border-accent/60"
      >
        <Share2 className="h-3.5 w-3.5" />
        {tx("Publish template")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            dir={ar ? "rtl" : "ltr"}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{tx("Publish design as template")}</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
              {tx("Your original stays exactly as you designed it. Anyone who uses it gets their own private copy to edit freely.")}
            </p>

            <label className="mb-1 block text-[11px] text-muted-foreground">{tx("Template name")}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-3 w-full rounded-lg border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
            />

            <label className="mb-1 block text-[11px] text-muted-foreground">{tx("Short description")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mb-3 w-full resize-none rounded-lg border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
            />

            <label className="mb-1 block text-[11px] text-muted-foreground">
              {tx("Tags (comma separated)")}
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={tx("luxury, dark, corporate")}
              className="mb-4 w-full rounded-lg border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
            />

            <label className="mb-1 block text-[11px] text-muted-foreground">
              {tx("Template kind")}
            </label>
            <div className="mb-4 flex gap-1 rounded-full border border-border/60 p-1">
              {(["personal", "employee", "mixed"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setAudience(k)}
                  className={
                    "flex-1 rounded-full px-2 py-1.5 text-[11px] font-semibold transition " +
                    (audience === k ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {audienceLabel(k, ar)}
                </button>
              ))}
            </div>

            <label className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              {tx("Visible to everyone in the gallery")}
            </label>

            <button
              onClick={submit}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
              {tx("Publish")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
