# Conventional Labeler

[![Test and Release](https://github.com/action-runner/conventional-labeler/actions/workflows/test.yaml/badge.svg)](https://github.com/action-runner/conventional-labeler/actions/workflows/test.yaml)

Conventional labeler will label your PR based on your PR's feature if it follows the conventional commit's guideline

## Required input

- access_token: can be set by using `${{ secrets.GITHUB_TOKEN }}`

## Example
```yaml
  label:
    runs-on: ubuntu-latest
    name: Lint PR
    steps:
      - name: label
        uses: action-runner/conventional-labeler@v1
        with:
          access_token: ${{ secrets.GITHUB_TOKEN }}
      - name: Get the output
        run: echo "The labels were ${{ steps.label.outputs.labels }}"

```