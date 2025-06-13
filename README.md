# 💎 Welcome to UVerify: Your Gateway to Blockchain Simplicity

<p align="center">
  <a href="https://github.com/UVerify-io/uverify-ui/actions/workflows/build.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/UVerify-io/uverify-ui/build.yml" alt="Test Workflow Status">
  </a>
  <a href="https://github.com/UVerify-io/uverify-ui/actions/workflows/test.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/UVerify-io/uverify-ui/test.yml?label=test" alt="Test Workflow Status">
  </a>
   <a href="https://github.com/UVerify-io/uverify-ui/actions/workflows/release.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/UVerify-io/uverify-ui/release.yml?label=release" alt="Release Workflow Status">
  </a>
   <a href="https://conventionalcommits.org">
    <img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white" alt="Conventional Commits">
  </a>
   <a href="https://discord.gg/Dvqkynn6xc">
    <img src="https://img.shields.io/discord/1263737876743589938" alt="Join our Discord">
  </a>
  <a href="https://cla-assistant.io/UVerify-io/uverify-ui"><img src="https://cla-assistant.io/readme/badge/UVerify-io/uverify-ui" alt="CLA assistant" /></a>
</p>

UVerify makes blockchain technology accessible to everyone, regardless of prior experience. Effortlessly secure your file or text hashes on the Cardano blockchain. Want to try it out before diving into the code? Visit [app.uverify.io](app.uverify.io) to explore the app.

## 🚀 Getting Started

To get started, clone the repository and run the following commands:

```zsh
npm install
npm run dev
```

### 🌻 Environment Variables

To run the application, you need to set up the following environment variables in a `.env` file:

```env
VITE_ADDITIONAL_TEMPLATES="MyCertificate:../path/to/my-template/src/Certificate.tsx"
VITE_BACKEND_URL=http://localhost:9090
VITE_CARDANO_NETWORK=preprod
```

| Variable Name               | Description                                                           | Default Value           |
|-----------------------------|-----------------------------------------------------------------------|-------------------------|
| `VITE_ADDITIONAL_TEMPLATES` | Path to additional templates for certificates                         | `""`                    |
| `VITE_BACKEND_URL`          | URL of the UVerify backend service                                    | `http://localhost:9090` |
| `VITE_CARDANO_NETWORK`      | Cardano network to connect to (e.g., `preprod`, `preview`, `mainnet`) | `preprod`               |

## 🚀 Features

- **Blockchain-Backed Notary Service**: Securely store file or text hashes on the Cardano blockchain for tamper-proof verification.
- **Intuitive User Interface**: Simple and user-friendly design to streamline the notarization process.
- **Customizable Metadata**: Add metadata to your hashes to enrich certificate details and personalize their appearance.
- **Flexible Certificate Templates**: Tailor the look and feel of certificates using predefined or custom templates.
- **Web3 Partnership System**: Contribute new templates or restrict access to specific templates for your users.
- **External Custom UI Templates**: Integrate private or external templates from separate repositories for enhanced flexibility.

## 🛠️ Key Configuration Options

### `uverify_template_id`
Use the `uverify_template_id` metadata field to customize the appearance of your certificates. This field allows you to select or define a template that matches your branding or use case.

### Creating Custom Templates
You can create and contribute new certificate templates or restrict them to specific users via the **Web3 Partnership System**. Follow these steps to get started:

1. **Generate a Template**:
   Use the UVerify CLI tool to initialize a new template:
   ```zsh
   npx @uverify/cli init my-template
   ```
2. **Customize the Template**:
   Modify the `Certificate.tsx` file in the generated template to suit your needs.
3. **Deploy the Template**:
   Add your custom template to the deployment by updating the `.env` file:
   ```zsh
   VITE_ADDITIONAL_TEMPLATES="MyCertificate:../path/to/my-template/src/Certificate.tsx"
   ```
   This allows you to keep templates private or host them in a separate repository.

For detailed instructions on creating and managing templates, visit the [uverify-ui-template repository](https://github.com/UVerify-io/uverify-ui-template).

## 💙 Contributing

We welcome all contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before getting started.

### Important Notes:

- Use **semantic commits** for all contributions.
- Sign the **Contributor License Agreement (CLA)** before committing. You can review the CLA [here](./CLA.md) and sign it via **[CLA Assistant](https://cla-assistant.io/)**. The CLA bot will guide you through the process when you open a pull request.
- For feature requests or tasks, please open an issue first to align with the project goals.

## 📚 Additional Documents

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security](SECURITY.md)
- [Contributor License Agreement (CLA)](./CLA.md)

## 📜 License

This project is licensed under the **AGPL**. If this license does not match your use case, feel free to reach out to us at **[hello@uverify.io](mailto:hello@uverify.io)** to discuss alternative licensing options.
