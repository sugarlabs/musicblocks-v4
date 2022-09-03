# Various Architectural Choices and the thought processes behind them

## Production Build Optimizations

-   Setup webpack bundle analyzer - the largest bundles are of `p5` (extensively used) and `esprima` (which is a peerdep of `js-yaml`, only used in one place).
-   Also had a look at website compression methods - `gzip` and `brotli` - the drawbacks are these need to be enabled at a web server level - and support varies in static files hosts. Will be using compression-webpack-plugin for this.
-   `p5` - production build lib - `p5.min.js` - 800KB -> compressed to 197KB
-   Github pages supports `gzip` but doesnt support `brotli`
-   Did not consider mangling output code (uglify.js and the likes)
-   Used `webpack-compression-plugin` with gzip and a threshold of 50KB to compress files

## Compression Algorithm Choice: `gzip` vs `brotli`

#### gzip

-   generic file compression format
-   can be used to compress build files for serving a website
-   decent compression ratio
-   fast compression/decompression
-   needs to be enabled at web server level

#### brotli

-   generic lossless compression algorithm built specifically for webpages
-   larger compression ratio than gzip
-   faster compression/decompression than gzip
-   lesser support from static site hosts (github pages doesn’t support brotli yet)

### Final Choice: `gzip`

#### Reasons

-   supported by GitHub pages
-   older and more supported by a large variety of systems
