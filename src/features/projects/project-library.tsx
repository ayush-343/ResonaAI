"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Upload, FileAudio, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cloneProject, newProject, type Project } from "./model";
import { deleteProject, listProjects, saveProject } from "./store";
import { extractDocument, projectFromText } from "./import";
import "./projects.css";
export function ProjectLibrary({ owner }: { owner: string }) {
  const [projects, setProjects] = useState<Project[]>([]), [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const [review, setReview] = useState<string | null>(null), [title, setTitle] = useState("");
  const router = useRouter();
  useEffect(() => { let active = true; void listProjects(owner).then(value => { if (active) { setProjects(value); setLoaded(true); } }).catch(error => { if (active) { setError(error.message); setLoaded(true); } }); return () => { active = false; }; }, [owner]);
  async function create(project: Project) {
    setBusy(true); setError("");
    try { await saveProject(project); router.push(`/projects/${project.id}`); }
    catch (error) { setError((error as Error).message); }
    finally { setBusy(false); }
  }
  async function importFile(file: File) {
    setBusy(true); setError("");
    try { setReview(await extractDocument(file)); setTitle(file.name.replace(/\.[^.]+$/, "")); }
    catch (error) { setError((error as Error).message); }
    finally { setBusy(false); }
  }
  async function remove(project: Project) {
    if (!window.confirm(`Delete “${project.title}” and its generated audio from this device?`)) return;
    setBusy(true);
    try { await deleteProject(owner, project.id); setProjects(await listProjects(owner)); }
    catch (error) { setError((error as Error).message); }
    finally { setBusy(false); }
  }
  return <div className="projects-page">
    <header className="projects-heading"><div><h2>Your words, a longer story.</h2><p>Create a cast, narrate a document, or pick up where you left off.</p></div><Button disabled={busy} onClick={() => void create(newProject(owner))}><Plus aria-hidden="true" />New project</Button></header>
    <section className="project-import" aria-labelledby="import-heading"><div><h3 id="import-heading">Start with a document</h3><p>TXT, DOCX, or a PDF with selectable text. Up to 20 MB and 100,000 characters. Files are read on this device.</p></div><label className="project-file-label"><Upload size={16} aria-hidden="true" />{busy ? "Working…" : "Import document"}<input aria-label="Import document" type="file" accept=".txt,.docx,.pdf" disabled={busy} onChange={event => { const file = event.target.files?.[0]; if (file) void importFile(file); event.target.value = ""; }} /></label></section>
    {error && <p role="alert" className="project-error">{error}</p>}
    {review !== null && <section className="import-review" aria-labelledby="review-heading"><h3 id="review-heading">Review your document</h3><p>Correct reading order and spacing here. Put <code># Chapter title</code> on its own line to start a chapter. Blank lines separate speech blocks.</p><label htmlFor="import-title">Project title</label><input id="import-title" value={title} maxLength={160} onChange={event => setTitle(event.target.value)} /><label htmlFor="import-text">Extracted text</label><textarea id="import-text" rows={14} value={review} onChange={event => setReview(event.target.value)} /><p>{review.length.toLocaleString()} / 100,000 characters</p><div className="project-actions"><Button disabled={busy} onClick={() => { try { void create(projectFromText(owner, title, review)); } catch (error) { setError((error as Error).message); } }}>Create from document</Button><Button variant="outline" disabled={busy} onClick={() => setReview(null)}>Cancel import</Button></div></section>}
    <section aria-labelledby="library-heading"><div className="projects-heading"><h3 id="library-heading">Saved on this device</h3><span>{projects.length} {projects.length === 1 ? "project" : "projects"}</span></div><p className="project-help">Projects belong to this account and workspace in this browser. Clearing browser data removes them. Duplicates copy the script; generate their audio separately.</p>
    {!loaded ? <p role="status">Loading projects…</p> : projects.length === 0 ? <div className="project-empty"><FileAudio aria-hidden="true" size={32} /><h3>A place for your next story</h3><p>Start a blank project or import a document. Add voices one section at a time.</p></div> : <ul className="project-list">{projects.map(project => <li key={project.id}><FileAudio aria-hidden="true" /><div><Link href={`/projects/${project.id}`}>{project.title}</Link><p>{project.chapters.length} chapters · Updated {new Date(project.updatedAt).toLocaleDateString()}</p></div><div className="project-actions"><Button variant="ghost" disabled={busy} aria-label={`Duplicate ${project.title}`} onClick={() => void create(cloneProject(project))}><Copy aria-hidden="true" /><span>Duplicate</span></Button><Button variant="ghost" disabled={busy} aria-label={`Delete ${project.title}`} onClick={() => void remove(project)}><Trash2 aria-hidden="true" /></Button></div></li>)}</ul>}</section>
  </div>;
}
