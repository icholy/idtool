# IDTOOL

> A tool for fetching a CDL ID's json content.

```
Options:
      --help      Show help                                            [boolean]
      --version   Show version number                                  [boolean]
  -e, --env       Environment to run in
                       [string] [choices: "dev", "stage", "v1"] [default: "dev"]
  -u, --username  AP3 username                               [string] [required]
  -p, --password  AP3 password                               [string] [required]
  -q, --query     Graphql query to augment the response                 [string]
  -f, --format    Format json before outputting        [boolean] [default: true]
  -i, --info      Output id properties                [boolean] [default: false]
  -t, --token     Output session token                [boolean] [default: false]
  -x, --extended  Request extended output                              [boolean]
      --nocache   Don't return cached info                             [boolean]
```

## Install

This package is not published on npm, so you'll need to clone and build locally.

```
git clone https://github.com/icholy/idtool.git
cd idtool
npm install
npm install -g .
```

## Config

Setting the `--username` and `--password` flags every time can be avoided by setting environment variables.

```sh
export IDTOOL_USERNAME=your.name@compassdigital.io
export IDTOOL_PASSWORD=secret
export IDTOOL_ENV=v1
```

## Example

### Get Info

```
$ idtool -i eW0gy25y3BFaYvgPlYgmfPmZloM3d2fE032BvlZDH2g5r6qkYau18BQgWGOGFAQMvl03NkHX80
raw      = eW0gy25y3BFaYvgPlYgmfPmZloM3d2fE032BvlZDH2g5r6qkYau18BQgWGOGFAQMvl03NkHX80
service  = location
provider = cdl
type     = group
id       = 7c732f634cbf443092ae6f289d80121f
url      = https://api.compassdigital.org/dev/location/group/eW0gy25y3BFaYvgPlYgmfPmZloM3d2fE032BvlZDH2g5r6qkYau18BQgWGOGFAQMvl03NkHX80
```

### Get Content

```
$ idtool eW0gy25y3BFaYvgPlYgmfPmZloM3d2fE032BvlZDH2g5r6qkYau18BQgWGOGFAQMvl03NkHX80 | head 
{
  "label": {
    "en": "2mato site - used in tests - DO NOT DELETE1"
  },
  "meta": {
    "sector_name": "CulinArt"
  },
  "address": {
    "state": "VA",
    "zip": "20190",
```
