# design/

非研发同学的前端设计稿目录。**先读 [AGENTS.md](./AGENTS.md)**，里面有完整流程与交付要求。

```
design/
├── AGENTS.md          流程、交付格式与禁止项（先读这个）
├── pages/             一个完整页面        → design/pages/pricing.html
├── sections/          页面里的一段        → design/sections/home-showcase.html
├── fragments/         页面里的一小块      → design/fragments/cta-banner.html + .css
└── assets/            图片/字体/视频      → 用相对路径引用，如 ../assets/hero.png
```

以 `_` 开头的文件编译时会被跳过，可以拿 `design/pages/_example.html` 当起点随便改。

除了这个目录，请不要改动仓库里的其他文件。
