import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import Dropdown, { DropdownItem } from '../../components/Dropdown.jsx';
import Spinner from '../../components/Spinner.jsx';
import { VISIBILITY } from '../../components/PostCard.jsx';
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronDownIcon,
  CodeIcon,
  EmbedIcon,
  GlobeIcon,
  HeartIcon,
  ImageIcon,
  LinkIcon,
  ListIcon,
  QuoteIcon,
  TrashIcon,
  UsersIcon,
} from '../../components/icons.jsx';
import { api } from '../../lib/api.js';
import { prepareImage } from '../../lib/image.js';
import { themeVars } from '../../lib/format.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const VIS_ICON = { public: <GlobeIcon width={18} height={18} />, followers: <UsersIcon width={18} height={18} />, supporters: <HeartIcon width={18} height={18} fill="currentColor" /> };

function youTubeId(input) {
  const v = String(input || '').trim();
  const m = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/.exec(v);
  return m ? m[1] : /^[A-Za-z0-9_-]{11}$/.test(v) ? v : null;
}

function VisibilityPicker({ value, onChange }) {
  return (
    <Dropdown
      className="vis-dropdown"
      align="left"
      trigger={({ toggle, open }) => (
        <button type="button" className="vis-trigger" onClick={toggle} aria-haspopup="menu" aria-expanded={open}>
          {VIS_ICON[value]} <span>{VISIBILITY[value].label}</span>
          <ChevronDownIcon width={18} height={18} />
        </button>
      )}
    >
      {Object.entries(VISIBILITY).map(([key, v]) => (
        <li key={key} role="none">
          <button type="button" role="menuitemradio" aria-checked={value === key} className="vis-option" onClick={() => onChange(key)}>
            <span className="vis-option-head">
              {VIS_ICON[key]} <strong>{v.label}</strong>
              {value === key && <CheckIcon width={16} height={16} className="vis-check" />}
            </span>
            <span className="vis-option-desc">{v.description}</span>
          </button>
        </li>
      ))}
    </Dropdown>
  );
}

export default function PostEditor() {
  const { id } = useParams();
  const { user, ready, isCreator } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const bodyRef = useRef(null);
  const imageInput = useRef(null);
  const [loaded, setLoaded] = useState(!id);
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    document.title = id ? 'Edit post' : 'Write a post';
    if (!isCreator) return;
    api('/studio/posts')
      .then((d) => setAllCategories(d.categories))
      .catch(() => {});
    if (!id) return;
    api(`/studio/posts/${id}`)
      .then(({ post: p }) => {
        setPost(p);
        setTitle(p.title);
        setVisibility(p.visibility);
        setCategories(p.categories);
        setLoaded(true);
      })
      .catch((err) => {
        toast(err.message, 'error');
        navigate('/dashboard/posts', { replace: true });
      });
  }, [id, isCreator]);

  useEffect(() => {
    if (loaded && bodyRef.current) {
      bodyRef.current.innerHTML = post?.html || '';
      setEmpty(!bodyRef.current.textContent.trim() && !bodyRef.current.querySelector('img,iframe'));
    }
  }, [loaded, post?.id]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (!ready) return <Spinner fullPage />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (!isCreator) return <Navigate to="/account" replace />;
  if (!loaded) return <Spinner fullPage />;

  const changed = () => {
    setDirty(true);
    if (bodyRef.current) setEmpty(!bodyRef.current.textContent.trim() && !bodyRef.current.querySelector('img,iframe'));
  };

  const exec = (cmd, arg) => {
    bodyRef.current.focus();
    document.execCommand(cmd, false, arg);
    changed();
  };

  const insertHtml = (html) => {
    bodyRef.current.focus();
    document.execCommand('insertHTML', false, html);
    changed();
  };

  const addLink = () => {
    const url = window.prompt('Link URL');
    if (url) exec('createLink', /^https?:\/\//i.test(url) ? url : `https://${url}`);
  };

  const addEmbed = () => {
    const input = window.prompt('Paste a YouTube link');
    if (!input) return;
    const vid = youTubeId(input);
    if (!vid) {
      toast('That doesn’t look like a YouTube link', 'error');
      return;
    }
    insertHtml(`<iframe src="https://www.youtube-nocookie.com/embed/${vid}" title="YouTube video" allowfullscreen></iframe><p><br></p>`);
  };

  const addImage = async (file) => {
    if (!file) return;
    const selection = window.getSelection();
    const range = selection.rangeCount ? selection.getRangeAt(0).cloneRange() : null;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', await prepareImage(file, 1600, 1600));
      const { url } = await api('/studio/uploads', { method: 'POST', form });
      bodyRef.current.focus();
      if (range && bodyRef.current.contains(range.startContainer)) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      insertHtml(`<img src="${url}" alt=""><p><br></p>`);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setUploading(false);
      imageInput.current.value = '';
    }
  };

  const toggleCategory = (c) => {
    setCategories((list) => (list.includes(c) ? list.filter((x) => x !== c) : [...list, c]));
    setDirty(true);
  };

  const addCategory = () => {
    const c = newCategory.trim().toLowerCase().slice(0, 30);
    if (!c) return;
    if (!allCategories.includes(c)) setAllCategories((l) => [...l, c].sort());
    if (!categories.includes(c)) setCategories((l) => [...l, c]);
    setNewCategory('');
    setAddingCategory(false);
    setDirty(true);
  };

  const save = async (status) => {
    if (!title.trim()) {
      toast('Give your post a title', 'error');
      return;
    }
    setBusy(true);
    try {
      const body = { title, html: bodyRef.current.innerHTML, visibility, categories, status };
      const { post: saved } = id
        ? await api(`/studio/posts/${id}`, { method: 'PUT', body })
        : await api('/studio/posts', { method: 'POST', body });
      setDirty(false);
      if (status === 'published') {
        toast(post?.status === 'published' ? 'Post updated' : 'Post published 🎉');
        navigate(`/${user.slug}/posts/${saved.slug}`);
      } else {
        toast('Draft saved');
        setPost(saved);
        if (!id) navigate(`/dashboard/posts/${saved.id}/edit`, { replace: true });
      }
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this post? This can’t be undone.')) return;
    try {
      await api(`/studio/posts/${id}`, { method: 'DELETE' });
      setDirty(false);
      toast('Post deleted');
      navigate('/dashboard/posts');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const isPublished = post?.status === 'published';
  const tool = (label, onClick, icon) => (
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onClick} aria-label={label} title={label}>
      {icon}
    </button>
  );

  return (
    <div className="editor-page" style={themeVars(user.themeColor)}>
      <div className="editor-grid">
        <div className="editor-main">
          <Link to="/dashboard/posts" className="pill-btn editor-back">
            <ArrowLeftIcon width={18} height={18} /> Dashboard
          </Link>
          <textarea
            className="editor-title"
            placeholder="Title"
            rows={1}
            maxLength={150}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value.replace(/\n/g, ''));
              setDirty(true);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
          />
          <div className="editor-toolbar">
            {tool('Bold', () => exec('bold'), <b>B</b>)}
            {tool('Italic', () => exec('italic'), <i>I</i>)}
            {tool('Underline', () => exec('underline'), <u>U</u>)}
            {tool('Link', addLink, <LinkIcon width={20} height={20} />)}
            {tool('Heading', () => exec('formatBlock', '<h2>'), <span className="tool-tt">TT</span>)}
            {tool('List', () => exec('insertUnorderedList'), <ListIcon width={20} height={20} />)}
            {tool('Quote', () => exec('formatBlock', '<blockquote>'), <QuoteIcon width={20} height={20} />)}
            {tool('Image', () => imageInput.current.click(), uploading ? <Spinner small /> : <ImageIcon width={20} height={20} />)}
            {tool('YouTube video', addEmbed, <EmbedIcon width={20} height={20} />)}
            {tool('Code', () => exec('formatBlock', '<pre>'), <CodeIcon width={20} height={20} />)}
            <input ref={imageInput} type="file" accept="image/*" hidden onChange={(e) => addImage(e.target.files[0])} />
          </div>
          <div
            ref={bodyRef}
            className={`editor-body post-body${empty ? ' is-empty' : ''}`}
            contentEditable
            suppressContentEditableWarning
            data-placeholder="Write something..."
            onInput={changed}
          />
        </div>

        <aside className="editor-side">
          <div className="publish-row editor-side-top">
            <button type="button" className="publish-btn" onClick={() => save('published')} disabled={busy || !title.trim() || empty}>
              {busy ? <Spinner small /> : isPublished ? 'Update post' : 'Publish now'}
            </button>
            <Dropdown
              trigger={({ toggle, open }) => (
                <button type="button" className="publish-more" onClick={toggle} aria-haspopup="menu" aria-expanded={open} aria-label="More publish options">
                  <ChevronDownIcon width={20} height={20} />
                </button>
              )}
            >
              <DropdownItem onClick={() => save(isPublished ? 'published' : 'draft')}>{isPublished ? 'Save changes' : 'Save as draft'}</DropdownItem>
              {isPublished && <DropdownItem onClick={() => save('draft')}>Unpublish (move to drafts)</DropdownItem>}
            </Dropdown>
          </div>
          <p className="editor-guidelines">
            This post must follow the <Link to="/terms">Terms &amp; Conditions</Link>.
          </p>

          <div className="editor-panel">
            <div className="editor-panel-section">
              <h3>Who can see this post?</h3>
              <VisibilityPicker
                value={visibility}
                onChange={(v) => {
                  setVisibility(v);
                  setDirty(true);
                }}
              />
            </div>
            <div className="editor-panel-section">
              <h3>Categories</h3>
              {allCategories.length === 0 && !addingCategory && (
                <div className="cat-empty">
                  <span className="studio-empty-icon">#</span>
                  <p className="muted">Categories make it easy to browse your posts.</p>
                </div>
              )}
              {allCategories.length > 0 && (
                <div className="chip-row chip-row-left">
                  {allCategories.map((c) => (
                    <button key={c} type="button" className={`cat-chip${categories.includes(c) ? ' active' : ''}`} onClick={() => toggleCategory(c)}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
              {addingCategory ? (
                <div className="input-with-btn">
                  <input
                    className="input-box input-sm"
                    autoFocus
                    maxLength={30}
                    placeholder="e.g. travel"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                  />
                  <button type="button" className="pill-btn pill-theme pill-sm" onClick={addCategory}>
                    Add
                  </button>
                </div>
              ) : (
                <button type="button" className="new-cat-btn" onClick={() => setAddingCategory(true)}>
                  + New category
                </button>
              )}
            </div>
          </div>

          {id && (
            <button type="button" className="text-link editor-delete" onClick={remove}>
              <TrashIcon width={16} height={16} /> Delete post
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
