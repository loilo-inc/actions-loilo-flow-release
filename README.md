# actions-loilo-flow-release

## Usage

See `action.yml`

```yaml
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
          with:
           # !IMPORTANT!
           # '0' means all histories. Set a better number for your use-case.
            fetch-depth: 0
        - uses: loilo-inc/actions-loilo-flow-release@main
          with:
            github-repository: ${{ github.repository }}
            github-token: ${{ github.token }}
            github-ref: ${{ github.ref }}
```
