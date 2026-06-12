# WordPress.org plugin assets

Files in this directory are deployed to the plugin Subversion `assets/` folder (banners, icons, screenshots, and Playground blueprints).

## Live Preview button

WordPress.org shows a **Live Preview** button beside **Download** when:

1. `assets/blueprints/blueprint.json` exists in SVN (this repo: `.wordpress-org/blueprints/blueprint.json`).
2. A plugin committer enables Live Preview on the plugin **Advanced** tab on wordpress.org.

Official documentation: [Previews and Blueprints](https://developer.wordpress.org/plugins/wordpress-org/previews-and-blueprints/).

Asset files (including the blueprint) are deployed to SVN when you publish a GitHub release. The `dot-org-deploy` workflow uses [10up/action-wordpress-plugin-deploy](https://github.com/10up/action-wordpress-plugin-deploy), which copies `.wordpress-org/` into the plugin SVN `assets/` folder on each release.

To ship the Live Preview blueprint without a plugin release, commit to SVN manually (below) or wait until the next release.

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
