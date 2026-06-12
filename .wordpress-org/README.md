# WordPress.org plugin assets

Files in this directory are deployed to the plugin Subversion `assets/` folder (banners, icons, screenshots, and Playground blueprints).

## Live Preview button

WordPress.org shows a **Live Preview** button beside **Download** when:

1. `assets/blueprints/blueprint.json` exists in SVN (this repo: `.wordpress-org/blueprints/blueprint.json`).
2. A plugin committer enables Live Preview on the plugin **Advanced** tab on wordpress.org.

Official documentation: [Previews and Blueprints](https://developer.wordpress.org/plugins/wordpress-org/previews-and-blueprints/).

After merging asset changes to `main`, the `dot-org-assets-deploy` workflow pushes updates to SVN when only readme and `.wordpress-org` files changed on that branch.

### Manual SVN deploy

```bash
svn co https://plugins.svn.wordpress.org/alpaca-issue-tracker svn-alpaca
rsync -av --exclude README.md .wordpress-org/ svn-alpaca/assets/
cd svn-alpaca
svn status
svn add assets/blueprints/blueprint.json   # first time only
svn ci -m "Add Playground blueprint for Live Preview"
```

Test with **Test Preview** on the plugin Advanced screen before enabling the public Live Preview toggle.
