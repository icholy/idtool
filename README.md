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
```

## Example

```
idtool -u your.name@compassdigital.io -p=secret eW0gy25y3BFaYvgPlYgmfPmZloM3d2fE032BvlZDH2g5r6qkYau18BQgWGOGFAQMvl03NkHX80
```

## Config

Setting the `--username` and `--password` flags every time can be avoided by setting environment variables.

```sh
export IDTOOL_USERNAME=your.name@compassdigital.io
export IDTOOL_PASSWORD=secret
export IDTOOL_ENV=v1
```
