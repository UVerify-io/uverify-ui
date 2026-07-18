# Changelog

## [3.12.0](https://github.com/UVerify-io/uverify-ui/compare/ui-v3.11.0...ui-v3.12.0) (2026-07-18)


### Features

* add X, Bluesky, WhatsApp, Facebook and email share options ([134ddbb](https://github.com/UVerify-io/uverify-ui/commit/134ddbbc5fbb03f36d09dccca5b63c48f4e1a82f))
* client-side short code derivation, salt cropping and short link config ([4b961bc](https://github.com/UVerify-io/uverify-ui/commit/4b961bc78a9976bb02b7eb449f34ece59b83f4bc))
* diploma document actions as icon buttons beside the awarded-to label ([0c14049](https://github.com/UVerify-io/uverify-ui/commit/0c14049cf632d1b0831b1cf80742ab08584f0f93))
* diploma print view with download button and verifiable QR code ([66ea45b](https://github.com/UVerify-io/uverify-ui/commit/66ea45b7e028a724c11cff4420deee0147ee15eb))
* enable sharing for certificate of insurance and digital product passport ([bd0d661](https://github.com/UVerify-io/uverify-ui/commit/bd0d6619a2b4698878326ed36f7f35ee9cc598e8))
* let additional templates ship their own og preview image ([71d5206](https://github.com/UVerify-io/uverify-ui/commit/71d5206f5b6f4135f71c1efed8d01d6024ac3c74))
* make certificate sharing a per-template opt-in ([a713689](https://github.com/UVerify-io/uverify-ui/commit/a713689f2bd3b88cbfb047d85b860ada5792ce82))
* make product verification template public for everyone ([da2c8ec](https://github.com/UVerify-io/uverify-ui/commit/da2c8ec588cdb28d6f3d79b669476a50a2a67278))
* move diploma download and share actions into the certificate header ([05a8202](https://github.com/UVerify-io/uverify-ui/commit/05a8202b933fc4e93191da1c2d8fa368f8851416))
* reserve uv_og_ keys and crop salt suffixes from displayed url params ([d4806a9](https://github.com/UVerify-io/uverify-ui/commit/d4806a917c8107d8ccbbae4f40fecd1b7bc2f6a1))
* share dialog with short link, QR code, LinkedIn and embed snippet ([dc23dfd](https://github.com/UVerify-io/uverify-ui/commit/dc23dfd1f43862bebcfbe9f9f4c0d3b9de7f86ff))
* ship per-template open graph images with hosting-level fallback ([f711db2](https://github.com/UVerify-io/uverify-ui/commit/f711db2f579a03c5de760745227001d4d5d992f0))


### Bug Fixes

* anchor diploma download and share actions below the certificate card ([ed4d4e6](https://github.com/UVerify-io/uverify-ui/commit/ed4d4e6f2a51360cca2f165d2c4a786b817d68b7))
* compact diploma header actions and full viewport gradient background ([4bca154](https://github.com/UVerify-io/uverify-ui/commit/4bca154cb0fd492dc531d601ab1e6a7182bb6a95))
* handle clipboard failures and clean up copy feedback timeout in share dialog ([727a6ac](https://github.com/UVerify-io/uverify-ui/commit/727a6ac483d4d53c215e439488e5e204d4846172))
* print the diploma as a single full page ([468b610](https://github.com/UVerify-io/uverify-ui/commit/468b61062e90b90ddcab1fd1a26918698cec53bf))
* update blockforce repository url to GitHub ([13b7ed2](https://github.com/UVerify-io/uverify-ui/commit/13b7ed254d5f2310302ad664864e3572376a24b9))
* use ReactElement instead of unavailable JSX namespace in share dialog ([2566850](https://github.com/UVerify-io/uverify-ui/commit/25668506d32d03d1d79fe1ace3fee9f15a89cebc))

## [3.11.0](https://github.com/UVerify-io/uverify-ui/compare/ui-v3.10.1...ui-v3.11.0) (2026-07-05)


### Features

* support uv_tid as short alias for uverify_template_id ([54a7aa8](https://github.com/UVerify-io/uverify-ui/commit/54a7aa8539258a2c1f9c913f599a050c08f0a280))

## [3.10.1](https://github.com/UVerify-io/uverify-ui/compare/ui-v3.10.0...ui-v3.10.1) (2026-06-13)


### Bug Fixes

* repair public key check in product verification template ([7bae835](https://github.com/UVerify-io/uverify-ui/commit/7bae8352c15c8b9d5d2fa1ae9fc91934587d8ca2))

## [3.10.0](https://github.com/UVerify-io/uverify-ui/compare/ui-v3.9.0...ui-v3.10.0) (2026-06-10)


### Features

* add blockforce template to ui templates ([e6f13ba](https://github.com/UVerify-io/uverify-ui/commit/e6f13ba5dc5cd05c8455065052f3d2501a488ceb))
* prepare supporting additional templates from GitLab, as well as privat repositories ([c31f927](https://github.com/UVerify-io/uverify-ui/commit/c31f9277b839f639f7f4bfecdb68d320b7daee93))


### Bug Fixes

* skip failing templates without throwing an error ([f0d8d14](https://github.com/UVerify-io/uverify-ui/commit/f0d8d14e9b3dac2b6f74c7b5e3a9c1e133ced590))

## [3.9.0](https://github.com/UVerify-io/uverify-ui/compare/ui-v3.8.1...ui-v3.9.0) (2026-05-25)


### Features

* add identity auth and agent receipt templates ([98285d2](https://github.com/UVerify-io/uverify-ui/commit/98285d26bc451ce739398a06e85a83aa9c93d211))


### Bug Fixes

* use latest core package ([84a1657](https://github.com/UVerify-io/uverify-ui/commit/84a1657a7623bd836de9dff521ca44f8e662cabd))

## [3.8.1](https://github.com/UVerify-io/uverify-ui/compare/ui-v3.8.0...ui-v3.8.1) (2026-05-16)


### Bug Fixes

* repair alert colors ([21c1bab](https://github.com/UVerify-io/uverify-ui/commit/21c1bab77d445f88a1802ccd78704822b5fb0e51))
* repair toast positions ([b6e9e28](https://github.com/UVerify-io/uverify-ui/commit/b6e9e280f99920648cad23fc06f9c32d1de37783))

## [3.8.0](https://github.com/UVerify-io/uverify-ui/compare/ui-v3.7.1...ui-v3.8.0) (2026-05-16)


### Features

* upgrade cardano-connect-with-wallet for CIP-158 support ([a2ad816](https://github.com/UVerify-io/uverify-ui/commit/a2ad816d8ff04ffcdce124746dc48ce9cd61d0ed))

## [3.7.1](https://github.com/UVerify-io/uverify-ui/compare/ui-v3.7.0...ui-v3.7.1) (2026-05-09)


### Bug Fixes

* upload a tag builder version to dockerhub and repair type issue ([edf1bf5](https://github.com/UVerify-io/uverify-ui/commit/edf1bf55c368e4b196fb308520ef83ab1625cdd3))

## [3.7.0](https://github.com/UVerify-io/uverify-ui/compare/ui-v3.6.3...ui-v3.7.0) (2026-04-28)


### Features

* update tokenizable certificate and add config file to allow using an alternative json for additional templates ([9d6b2b2](https://github.com/UVerify-io/uverify-ui/commit/9d6b2b2a38a40009a8f2e030cb00a6a34e1fefe9))


### Bug Fixes

* templates in template selector were invisible on Windows machines ([3313633](https://github.com/UVerify-io/uverify-ui/commit/33136334f498725f0cd81dfbaaf2db642f214b6d))

## [3.6.3](https://github.com/UVerify-io/uverify-ui/compare/ui-v3.6.2...ui-v3.6.3) (2026-04-01)


### Bug Fixes

* verified fix of testnet faucet in action ([010c1e5](https://github.com/UVerify-io/uverify-ui/commit/010c1e5c0ea3c2eff983b2680a7b637130e944bd))

## [3.6.2](https://github.com/UVerify-io/uverify-ui/compare/ui-v3.6.1...ui-v3.6.2) (2026-04-01)


### Bug Fixes

* upgrade sdks to prevent testnet fueling issue ([549eab0](https://github.com/UVerify-io/uverify-ui/commit/549eab0ff2d60406b6b7fa6954756366b284fc21))

## [3.6.1](https://github.com/UVerify-io/uverify-ui/compare/ui-v3.6.0...ui-v3.6.1) (2026-04-01)


### Bug Fixes

* upgrade the uverify-sdk to fix that insufficient funds won't trigger the faucet call ([31713fc](https://github.com/UVerify-io/uverify-ui/commit/31713fc0fa19970cb3c1b1acc81a5d1dd89bc569))

## [3.6.0](https://github.com/UVerify-io/uverify-ui/compare/ui-v3.5.0...ui-v3.6.0) (2026-03-29)


### Features

* add uverify faucet as an ui function, allowing people to fuel up a disposable wallet ([e5ed36a](https://github.com/UVerify-io/uverify-ui/commit/e5ed36a8c575f65c5705b2815a3f6fd208ab6d94))
* **mainnet:** link to preprod deployment for testing without wallet ([16ef610](https://github.com/UVerify-io/uverify-ui/commit/16ef61070ffc184580c671483c8523daed7619a2))


### Bug Fixes

* upgrade all dependency version and update connect with wallet button and core version ([edc4328](https://github.com/UVerify-io/uverify-ui/commit/edc4328e5e8ecd2a1d59ba33532d61cda8b3e870))

## [3.5.0](https://github.com/UVerify-io/uverify-ui/compare/ui-v3.4.0...ui-v3.5.0) (2026-03-22)


### Features

* add optional templates based on enabled backend extensions ([832e759](https://github.com/UVerify-io/uverify-ui/commit/832e7598de73ecc6608be74aaa6897c08119594d))

## [3.4.0](https://github.com/UVerify-io/uverify-ui/compare/ui-v3.3.1...ui-v3.4.0) (2026-03-16)


### Features

* add network switcher and explainer for sdks and custom templates ([bfce9e1](https://github.com/UVerify-io/uverify-ui/commit/bfce9e1ac7d0d2244dde16d760647ef87731b355))


### Bug Fixes

* enhance wallet connect error messages ([c980cc8](https://github.com/UVerify-io/uverify-ui/commit/c980cc86a033099d9585a8c50e9aadc1a78082e5))

## [3.3.1](https://github.com/UVerify-io/uverify-ui/compare/v3.3.0...v3.3.1) (2026-03-15)


### Bug Fixes

* file dropzone applied sha256 on utf-8 encoded file content instead of the raw bytes ([18e9a13](https://github.com/UVerify-io/uverify-ui/commit/18e9a137b14ebf0a0758317923db5ab1f294e92f))

## [3.3.0](https://github.com/UVerify-io/uverify-ui/compare/v3.2.0...v3.3.0) (2026-03-15)


### Features

* Add document integrity template ([fe103f5](https://github.com/UVerify-io/uverify-ui/commit/fe103f569274c0dc19c3b26eff7e99a5e5bc84a2))

## [3.2.0](https://github.com/UVerify-io/uverify-ui/compare/v3.1.0...v3.2.0) (2026-03-13)


### Features

* adding COI template as an insurance related use-case ([c569bb9](https://github.com/UVerify-io/uverify-ui/commit/c569bb929c0ab5ec2cc3980083cc1cbd9b1e419f))

## [3.1.0](https://github.com/UVerify-io/uverify-ui/compare/v3.0.0...v3.1.0) (2026-03-12)


### Features

* add laboratory report and digital prodcut passport template ([742f8b3](https://github.com/UVerify-io/uverify-ui/commit/742f8b39002ba973cfdcd9fc2544f3be05d1698f))
* allow to filter applicable templates by bootstrap token whitelist. Closes [#32](https://github.com/UVerify-io/uverify-ui/issues/32) ([e813f2b](https://github.com/UVerify-io/uverify-ui/commit/e813f2b087c95fd458cc5f4191ce4c3522cd372d))


### Bug Fixes

* align margins and unify style. fix template policy selector ([f5fad4a](https://github.com/UVerify-io/uverify-ui/commit/f5fad4a64697a16155b3a34a83ce09c3fe495698))
* change default update behaviours of templates ([b188649](https://github.com/UVerify-io/uverify-ui/commit/b1886494b53797037b33eb5ede2fb8e1e6975d17))

## [3.0.0](https://github.com/UVerify-io/uverify-ui/compare/v2.1.0...v3.0.0) (2026-03-07)


### ⚠ BREAKING CHANGES

* new dark design and better accessibility

### Features

* new dark design and better accessibility ([bd5c424](https://github.com/UVerify-io/uverify-ui/commit/bd5c42441f4e97efb60a7733c23de0cb910d5da2))

## [2.1.0](https://github.com/UVerify-io/uverify-ui/compare/v2.0.0...v2.1.0) (2026-03-06)


### Features

* add gdpr url feature to allow anchoring just a hash of certain metadata ([c707d11](https://github.com/UVerify-io/uverify-ui/commit/c707d117d7b05d669cbdbbda8d3327aaa226aaf4))
* add pet necklace template ([a5379c1](https://github.com/UVerify-io/uverify-ui/commit/a5379c19e9edb9b1c0c1adf53ab49b268a367515))

## [2.0.0](https://github.com/UVerify-io/uverify-ui/compare/v1.9.0...v2.0.0) (2026-03-01)


### ⚠ BREAKING CHANGES

* additional templates are now maintained in a json file and tadamon and social hub have been moved to an external repository closes #47 closes #45 closes #41

### Features

* additional templates are now maintained in a json file and tadamon and social hub have been moved to an external repository closes [#47](https://github.com/UVerify-io/uverify-ui/issues/47) closes [#45](https://github.com/UVerify-io/uverify-ui/issues/45) closes [#41](https://github.com/UVerify-io/uverify-ui/issues/41) ([2c3c081](https://github.com/UVerify-io/uverify-ui/commit/2c3c08117514b36539f590b2dcab797801ada620))


### Bug Fixes

* prevent the ui from showing the default template for one second before loading the actual one ([3b8b82d](https://github.com/UVerify-io/uverify-ui/commit/3b8b82dba318c8c93da20c15c0fef4a094e9d62a))

## [1.9.0](https://github.com/UVerify-io/uverify-ui/compare/v1.8.0...v1.9.0) (2026-02-19)


### Features

* allow users to provide the data in deeplinks instead of the hash. Fix certification page with invalid hash. ([974bdaf](https://github.com/UVerify-io/uverify-ui/commit/974bdaf7c5e6cb7196370e42f0dc59823ab1d5e1))

## [1.8.0](https://github.com/UVerify-io/uverify-ui/compare/v1.7.1...v1.8.0) (2026-02-08)


### Features

* add product verification template ([e753f49](https://github.com/UVerify-io/uverify-ui/commit/e753f49eda7646751f80ad5d43a7bc828549d738))

## [1.7.1](https://github.com/UVerify-io/uverify-ui/compare/v1.7.0...v1.7.1) (2025-07-16)


### Bug Fixes

* **docker:** add dotenv depend so config.js from entrypoint works ([5ee72d6](https://github.com/UVerify-io/uverify-ui/commit/5ee72d6a3574fe7fa746f30608805d3c2b0f4589))
* **docker:** add dotenv depend so config.js from entrypoint works ([ae6b825](https://github.com/UVerify-io/uverify-ui/commit/ae6b825c1d54d18c9b13460743aef11accc340a2))

## [1.7.0](https://github.com/UVerify-io/uverify-ui/compare/v1.6.0...v1.7.0) (2025-06-14)


### Features

* implement proper error messages in case of wallet connect errors. closes [#17](https://github.com/UVerify-io/uverify-ui/issues/17) ([08d3e8a](https://github.com/UVerify-io/uverify-ui/commit/08d3e8abc9a9e18e032e5dbec4d2885bde574b58))


### Bug Fixes

* **social hub:** adding connect wallet error messages as well for the social hub template. ([891fee2](https://github.com/UVerify-io/uverify-ui/commit/891fee24d17e73c916e8825036c5c24c906d7c62))

## [1.6.0](https://github.com/UVerify-io/uverify-ui/compare/v1.5.0...v1.6.0) (2025-06-11)


### Features

* provide a docker solution for a custom ui container setup ([9bbf400](https://github.com/UVerify-io/uverify-ui/commit/9bbf40019a74c69b68723a7016466cee0b230b6f))

## [1.5.0](https://github.com/UVerify-io/uverify-ui/compare/v1.4.5...v1.5.0) (2025-06-08)


### Features

* allow import of additional ui template from outside the src folder ([7992aa4](https://github.com/UVerify-io/uverify-ui/commit/7992aa44eb2f54da45224311e18b5c171706063e))
* move common parts of core and custom ui interfaces to @uverify/core ([bc6920a](https://github.com/UVerify-io/uverify-ui/commit/bc6920a710160e44ed911d40b51437ef69b47267))

## [1.4.5](https://github.com/UVerify-io/uverify-ui/compare/v1.4.4...v1.4.5) (2025-06-02)


### Bug Fixes

* **tadamon:** fix config resolution (and therefore, cexplorer links) ([c214b75](https://github.com/UVerify-io/uverify-ui/commit/c214b75184b0547e06068b63f00ae5f77ed34aee))

## [1.4.4](https://github.com/UVerify-io/uverify-ui/compare/v1.4.3...v1.4.4) (2025-05-24)


### Bug Fixes

* remove logging ([f3a02d9](https://github.com/UVerify-io/uverify-ui/commit/f3a02d9d940957fca1d0581c9567b66a51d06fb4))

## [1.4.3](https://github.com/UVerify-io/uverify-ui/compare/v1.4.2...v1.4.3) (2025-05-23)


### Bug Fixes

* **tadamon:** resolve ui issues and remove footer, even if no colors are provided with the theme object ([381a373](https://github.com/UVerify-io/uverify-ui/commit/381a3736727811e99cbe34b088c733390e176ced))

## [1.4.2](https://github.com/UVerify-io/uverify-ui/compare/v1.4.1...v1.4.2) (2025-05-21)


### Bug Fixes

* transaction build endpoint response with new schema ([b0a98c4](https://github.com/UVerify-io/uverify-ui/commit/b0a98c4fc4a821346a3290a02d8875f46c900dcb))

## [1.4.1](https://github.com/UVerify-io/uverify-ui/compare/v1.4.0...v1.4.1) (2025-05-21)


### Bug Fixes

* handle case when beneficiary_sign_date is not a number nor a string and swap logos ([a8647b3](https://github.com/UVerify-io/uverify-ui/commit/a8647b330c8a98c819877bfa9f9609431a2c140b))

## [1.4.0](https://github.com/UVerify-io/uverify-ui/compare/v1.3.4...v1.4.0) (2025-05-20)


### Features

* implement tadamon certificate custom ui ([86982bd](https://github.com/UVerify-io/uverify-ui/commit/86982bd1780029490bbb034e9d3c005fd53e7a10))


### Bug Fixes

* make config hook an actual provider to prevent the config from being fetched multiple times ([9236d59](https://github.com/UVerify-io/uverify-ui/commit/9236d594a7a150fc24814ead6e15478046a5d58a))
* make sure the config has been loaded before the app gots injected ([22aed24](https://github.com/UVerify-io/uverify-ui/commit/22aed2460a5ae7de0e29d1fabc8176d8bef2cb5b))
* **social hub:** use links directly if provided as part of the account name ([079fd24](https://github.com/UVerify-io/uverify-ui/commit/079fd243a5e49a46120a41da90a5ff8284174554))

## [1.3.4](https://github.com/UVerify-io/uverify-ui/compare/v1.3.3...v1.3.4) (2025-05-07)


### Bug Fixes

* remove typo in fallback url ([7bb9c22](https://github.com/UVerify-io/uverify-ui/commit/7bb9c22fe75a590b22282f39ce1175e6fe40842d))

## [1.3.3](https://github.com/UVerify-io/uverify-ui/compare/v1.3.2...v1.3.3) (2025-05-07)


### Bug Fixes

* **docker:** nginx does now resolve deeplinks correctly ([1a305a6](https://github.com/UVerify-io/uverify-ui/commit/1a305a6c3266507b81f145347d65cb5ab69a8795))

## [1.3.2](https://github.com/UVerify-io/uverify-ui/compare/v1.3.1...v1.3.2) (2025-04-24)


### Bug Fixes

* bump connect wallet version to fix eternl url ([970f17e](https://github.com/UVerify-io/uverify-ui/commit/970f17e14a5ed6d665a4f3bb865c2cfa3deb3e5f))

## [1.3.1](https://github.com/UVerify-io/uverify-ui/compare/v1.3.0...v1.3.1) (2025-04-24)


### Bug Fixes

* correct wrong link to play and app store ([89d686d](https://github.com/UVerify-io/uverify-ui/commit/89d686d3deb651caa6c30937bb9559fa5fff90ba))

## [1.3.0](https://github.com/UVerify-io/uverify-ui/compare/v1.2.1...v1.3.0) (2025-04-24)


### Features

* add mobile instructions and support for in-app browsers ([8e12c94](https://github.com/UVerify-io/uverify-ui/commit/8e12c9409d326243351cf60475d305b8ac6e072c))

## [1.2.1](https://github.com/UVerify-io/uverify-ui/compare/v1.2.0...v1.2.1) (2025-04-23)


### Bug Fixes

* encypt social hub before submitting it on-chain ([86d9f7e](https://github.com/UVerify-io/uverify-ui/commit/86d9f7e0ce4afb6ef748a62fb67c510dd6e2843a))

## [1.2.0](https://github.com/UVerify-io/uverify-ui/compare/v1.1.2...v1.2.0) (2025-04-19)

### Features

- add socialHub and connected goods extension ([4d283cd](https://github.com/UVerify-io/uverify-ui/commit/4d283cdb6cde988e12f638747fd320b8bb949b83))
- dynamic cardano network management based on environment variables ([eaa61a9](https://github.com/UVerify-io/uverify-ui/commit/eaa61a96e2245e1a4c8ea59d99d7f2b1d7c828e1))

### Bug Fixes

- repair pagination style ([672cfd1](https://github.com/UVerify-io/uverify-ui/commit/672cfd1c0faf4fd0e4a757ab2891a0f8138a04e8))

## [1.1.2](https://github.com/UVerify-io/uverify-ui/compare/v1.1.1...v1.1.2) (2025-03-15)

### Bug Fixes

- repair identity card for monochrome template. fixes [#16](https://github.com/UVerify-io/uverify-ui/issues/16) ([4be3738](https://github.com/UVerify-io/uverify-ui/commit/4be3738c40f635a48e40ad8dbc8fe245acc1dd34))

## [1.1.1](https://github.com/UVerify-io/uverify-ui/compare/v1.1.0...v1.1.1) (2025-03-13)

### Bug Fixes

- add uverify_template_id in case of using the dropdown ([66693a7](https://github.com/UVerify-io/uverify-ui/commit/66693a7f3c85275df9da85f0d961ec48caea2d1c))

## [1.1.0](https://github.com/UVerify-io/uverify-ui/compare/v1.0.0...v1.1.0) (2025-03-12)

### Features

- add preview for different layout types ([01717b3](https://github.com/UVerify-io/uverify-ui/commit/01717b396e7f3631ad552572ebfe8d3332cd96ff))
- add template selector and dynmaic inputs ([6f64b54](https://github.com/UVerify-io/uverify-ui/commit/6f64b54b38c4e704f041b19cdae4271cf6ddc152))
- showing a preview of the certificate page ([1d7817d](https://github.com/UVerify-io/uverify-ui/commit/1d7817d25a182bad5a97332838c6c09d2408d60f))

## 1.0.0 (2025-02-22)

### Features

- add basic template engine and monochrome template ([70ac2a6](https://github.com/UVerify-io/uverify-ui/commit/70ac2a6bf1d725e9e699d406ef9f3dba73d92fd1))
- add diploma template ([1742b2a](https://github.com/UVerify-io/uverify-ui/commit/1742b2a3d488c2930a218b6ab7851d81e1ae8ecb))
- add more social icons and a link to the impress ([f01378c](https://github.com/UVerify-io/uverify-ui/commit/f01378c038523633c6d50fd9f891b5f6f58c9643))
- link privacy policy and terms of use in the footer ([306c474](https://github.com/UVerify-io/uverify-ui/commit/306c474088ae560323dfe6b58d7beedaabb615be))
- update requests to match the new api version ([a536428](https://github.com/UVerify-io/uverify-ui/commit/a536428e150e3574dffee6dfbcb215c39c180a87))

### Bug Fixes

- use sign partially to fix eternl issue ([a8e8b1e](https://github.com/UVerify-io/uverify-ui/commit/a8e8b1ed830b36df1964da76e75614d2a60c0c83))
