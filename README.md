# sridhar-maharaj-archive

TODO: better folder names

MD source: `/ru-no-footnotes`

MD with extracted footnotes: `/ru`

Do not modify `/ru`, modify only `/ru-no-footnotes`, then convert `ru-no-footnotes` to `ru`:

```
cd scripts
node footnotes-analyze.js
```

### Old migrations

Add meta from `ru-no-footnotes-sources` to `ru-no-footnotes`:

```
cd scripts
node migrations/2026-05-02/run.js
```

