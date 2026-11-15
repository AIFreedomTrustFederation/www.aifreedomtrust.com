"""Join the source files into one self-contained page."""
import pathlib, sys

root = pathlib.Path(__file__).parent
src = root / "src"
css = (src / "style.css").read_text(encoding="utf-8")
js = "\n".join((src / f).read_text(encoding="utf-8") for f in
               ["data.js", "engine.js", "tree.js", "worlds.js", "app-core.js", "app-ui.js"])
assert "</script" not in js.lower()
html = (src / "index.tpl.html").read_text(encoding="utf-8")
html = html.replace("/*__CSS__*/", css).replace("/*__JS__*/", js)
out = root / "dist"
out.mkdir(exist_ok=True)
(out / "index.html").write_text(html, encoding="utf-8")
print("built", len(html.encode("utf-8")), "bytes")
