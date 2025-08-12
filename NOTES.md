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

===

https://github.com/hello-pangea/dnd
https://dnd.hellopangea.com/?path=/docs/welcome--docs
https://dnd.hellopangea.com/?path=/story/examples-board--simple

OR: dndkit, which is slightly more maintained

npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/modifiers
added 8 packages
Add to package.json:

```
{
    "alias": {
        "react": "@wordpress/element",
        "react-dom": "@wordpress/element"
    }
}
```

Added shim files because: The catch: @wordpress/element is not a React-compatible npm package; it's a WordPress package exposed in global scope (window.wp.element) at runtime. Parcel can't resolve @wordpress/element to a proper React package in node_modules because it does not exist as such. So the real fix: Instead of aliasing react and react-dom to @wordpress/element, alias them to the global React and ReactDOM exposed by WordPress at runtime.
