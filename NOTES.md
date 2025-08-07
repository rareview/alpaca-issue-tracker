I needed to:

- npm install --save-dev parcel
- create a basic package.json
- spell out _exactly_ which file to begin build from (can't just use `source`)
- `npm run build` - or even better: `npm run watch`

To get it to process a .scss file:

- I needed to npm uninstall parcel-builder, then npm install parcel --save-dev

Capturing images:

- snapDOM is super quick and flexible
- but I'm seeing a few issues relating to div dimensions
- probably good enough for now
