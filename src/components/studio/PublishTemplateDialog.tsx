// Publish the current Studio design to the community template gallery.
import { useState } from "react";
import { Loader2, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { useStudio } from "@/lib/studio/store";
import { publishTemplate } from "@/lib/templates";

export function PublishTemplateDialog({ ar, defaultTitle }: { ar: boolean; defaultTitle?: string }) {
  const { state } = useStudio();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(defaultTitle || "");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!title.trim()) {
      toast.error(ar ? "اكتب اسم القالب" : "Give the template a name");
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
      });
      toast.success(
        isPublic
          ? ar ? "تم نشر القالب للعامة" : "Template published"
          : ar ? "تم حفظ القالب كمسودة خاصة" : "Template saved privately",
      );
      setOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
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
        {ar ? "نشر كقالب" : "Publish template"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            dir={ar ? "rtl" : "ltr"}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{ar ? "نشر التصميم كقالب" : "Publish design as template"}</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
              {ar
                ? "سيبقى قالبك الأصلي محفوظاً كما صمّمته. من يستخدمه يحصل على نسخة خاصة به يعدّلها بحرية دون أي تأثير على تصميمك."
                : "Your original stays exactly as you designed it. Anyone who uses it gets their own private copy to edit freely."}
            </p>

            <label className="mb-1 block text-[11px] text-muted-foreground">{ar ? "اسم القالب" : "Template name"}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-3 w-full rounded-lg border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
            />

            <label className="mb-1 block text-[11px] text-muted-foreground">{ar ? "وصف مختصر" : "Short description"}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mb-3 w-full resize-none rounded-lg border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
            />

            <label className="mb-1 block text-[11px] text-muted-foreground">
              {ar ? "وسوم (افصل بفاصلة)" : "Tags (comma separated)"}
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={ar ? "فاخر, داكن, شركات" : "luxury, dark, corporate"}
              className="mb-4 w-full rounded-lg border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
            />

            <label className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              {ar ? "متاح للجميع في معرض القوالب" : "Visible to everyone in the gallery"}
            </label>

            <button
              onClick={submit}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
              {ar ? "نشر" : "Publish"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
