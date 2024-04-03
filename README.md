# Setup Kit CLI

This action provides downloading and caching distribution of the requested Kit
CLI, and adding it to the PATH

## Usage

See [action.yml](action.yml)

```YAML
- uses: setup-kit@v1
  with:
    # The version of Kit CLI to install. Defaults to `latest`
    version: v0.1.1
    # Used to pull kit CLI releases. Since there's a default, this is
    # typically not needed to be suplied.
    # When running this action on github.com, the default value is
    # sufficient.
    # When running on GHES, you can pass a personal access token
    # for github.com to avoid rate limiting.
    token: ''
```

#### Basic

```YAML
steps:
  - uses: setup-kit@v1
    id: install_kit

  - name: Run kit command
    shell: bash
    run: |
      set -x
      kit version
```

#### Pin a kit version

```YAML
steps:
  - uses: setup-kit@v1
    id: install_kit
    with:
      version: v0.1.1

  - name: Run kit command
    shell: bash
    run: |
      set -x
      kit version
```

### Supported version syntax

The `version` input supports the Semantic Versioning Specification, for more
detailed examples please refer to
[the SemVer package documentation](https://github.com/npm/node-semver).

## Contributing

> [!NOTE]
>
> You'll need to have a reasonably modern version of
> [Node.js](https://nodejs.org) handy (20.x or later should work!). If you are
> using a version manager like [`nodenv`](https://github.com/nodenv/nodenv) or
> [`nvm`](https://github.com/nvm-sh/nvm), the `.node-version` file at the root
> of the repository that will be used to automatically switch to the correct
> version when you `cd` into the repository. Additionally, this `.node-version`
> file is used by GitHub Actions in any `actions/setup-node` actions.

1. Clone this reposutory

1. :hammer_and_wrench: Install the dependencies

   ```bash
   npm install
   ```

1. :building_construction: Package the TypeScript for distribution

   ```bash
   npm run bundle
   ```

1. :white_check_mark: Run the tests

   ```bash
   npm test
   ```

## Publishing a New Release

This project includes a helper script, [`script/release`](./script/release)
designed to streamline the process of tagging and pushing new releases for
GitHub Actions.

GitHub Actions allows users to select a specific version of the action to use,
based on release tags. This script simplifies this process by performing the
following steps:

1. **Retrieving the latest release tag:** The script starts by fetching the most
   recent release tag by looking at the local data available in your repository.
1. **Prompting for a new release tag:** The user is then prompted to enter a new
   release tag. To assist with this, the script displays the latest release tag
   and provides a regular expression to validate the format of the new tag.
1. **Tagging the new release:** Once a valid new tag is entered, the script tags
   the new release.
1. **Pushing the new tag to the remote:** Finally, the script pushes the new tag
   to the remote repository. From here, you will need to create a new release in
   GitHub and users can easily reference the new tag in their workflows.
