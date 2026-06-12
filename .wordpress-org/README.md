# WordPress.org plugin assets

Files in this directory are deployed to the plugin Subversion `assets/` folder (banners, icons, screenshots, and Playground blueprints).

Asset files are deployed to SVN when you publish a GitHub release. The `dot-org-deploy` workflow uses [10up/action-wordpress-plugin-deploy](https://github.com/10up/action-wordpress-plugin-deploy), which copies `.wordpress-org/` into the plugin SVN `assets/` folder on each release.

To update assets without a release, commit to SVN manually:

```bash
svn co https://plugins.svn.wordpress.org/alpaca-issue-tracker svn-alpaca
rsync -av --exclude README.md .wordpress-org/ svn-alpaca/assets/
cd svn-alpaca
svn status
svn add assets/blueprints/blueprint.json   # first time only
svn ci -m "Update plugin directory assets"
```
