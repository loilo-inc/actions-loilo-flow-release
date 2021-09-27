# actions-loilo-flow-release

## Usage

See `action.yml`

```yaml
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v1
        - uses: loilo-inc/actions-loilo-flow-release
          with:
            github-repository: ${{ github.repository }}
            github-token: ${{ github.token }}
            github-ref: ${{ github.ref }}
```
