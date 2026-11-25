/* V2: structured evidence and interactive examples. Prose stays in index.html. */
window.SPEC_V2 = {
  snapshot: {
    rc: "v0.32.0rc1@24487f4f",
    main: "main@4ec1a32e",
    upstream: "vllm@5c08d2c72a",
    checked: "2026-11-24"
  },
  timeline: [
    { date: "2022.11", title: "Speculative Decoding", text: "小规模 draft 连续提议，target 并行验证；标准拒绝采样保持目标分布。", url: "https://arxiv.org/abs/2211.17192", focus: false },
    { date: "2024.01", title: "Medusa / EAGLE", text: "多个解码头与特征层自回归，让 draft 更贴近 target。", url: "https://arxiv.org/abs/2401.15077", focus: false },
    { date: "2024.04", title: "Multi-Token Prediction", text: "共享模型躯干，用多个独立输出头并行学习多个未来 Token。", url: "https://arxiv.org/abs/2404.19737", focus: true },
    { date: "2024.11", title: "SuffixDecoding", text: "从提示词和历史输出的重复模式中生成候选。", url: "https://arxiv.org/abs/2411.04975", focus: false },
    { date: "2025.03", title: "EAGLE-3", text: "直接预测 Token，并融合目标模型多层特征。", url: "https://arxiv.org/abs/2503.01840", focus: false },
    { date: "2026.02", title: "DFlash", text: "target context 逐层注入 draft KV cache，再用 block diffusion 一次完成块并行 draft。", url: "https://arxiv.org/abs/2602.06036", focus: true },
    { date: "2026.07", title: "DSpark", text: "并行骨干上增加 Markov 修正和 confidence 调度。", url: "https://arxiv.org/abs/2607.05147", focus: true },
    { date: "2026.08", title: "DFlash2", text: "在候选格上加入局部卷积与 selector walk。", url: "https://inco.ai/blog/dflash2", focus: true }
  ],
  methods: [
    { name: "MTP", rc: "支持：MRV1 / MRV2；eager 或 ACL Graph。DeepSeek 单层 MTP 时 K>1 的精度和性能无保证，尤其 K≥3。", rcDialog: "deepseekMtpLayersDialog", main: "支持：MRV2。保留单层 DeepSeek MTP 的 K 警告与 n×(K+1) 图档位约束。" },
    { name: "DFlash", rc: "支持：MRV1 / MRV2；公开 MRV2 CI 覆盖 FULL_DECODE_ONLY 与 FULL_AND_PIECEWISE。", main: "支持：MRV2。K 由 checkpoint、后端与图档位共同约束。", mainDialog: "dflashKConstraintsDialog" },
    { name: "DSpark", rc: "分路径支持：MRV1 draft eager；MRV2 target 可用 full graph。Adaptive 仅 MRV2，不能与 fully eager / 纯 PIECEWISE target 同用。", rcDialog: "dsparkExecutionDialog", main: "支持 fixed / adaptive。Adaptive 仍禁止 fully eager、纯 PIECEWISE、PP、PCP、DCP、LoRA。", mainDialog: "dsparkExecutionDialog" },
    { name: "DFlash2", rc: "MRV2 可核查路径为 eager draft；target 可独立 full graph。MRV1 对应公开用例被 skip。", rcDialog: "dflash2ExecutionDialog", main: "支持 eager / full ACL graph。要求完整、未量化 target LM head；LM-head TP 不支持 probabilistic draft。", mainDialog: "dflash2ExecutionDialog" }
  ],
  modelEvidence: [
    { family: "DeepSeek", model: "V4.1-Flash / 1017", mtp: "不列入支持：mtp.* 实际是 DSpark stages", dflash: "—", dspark: "rc1/main：教程 + 测试，K=5；含 PD/PCP 配置", dflash2: "—", evidence: "DeepSeek-V4.1-Flash.md；公开 nightly / SIT；A2/A3/950DT" },
    { family: "Qwen", model: "3.8-27B", mtp: "rc1/main：教程 + 测试，K=3；300I 推荐 K=1", dflash: "普通 DFlash 未找到用例", dspark: "main 受限：仅 adaptive GDN 文档，未给 checkpoint/golden", dflash2: "rc1/main：文档 + CI + PR；公开 CI K=7，main 增加 full-graph 证据", evidence: "Qwen3.8-27B.md；test_spec_decode.py；#14533 / #19512" },
    { family: "Qwen", model: "3.8-2.4T-A95B", mtp: "rc1/main：文档验证部署，K=1", dflash: "—", dspark: "—", dflash2: "—", evidence: "Qwen3.8-2.4T-A95B.md；A3/A2 validated deployment" },
    { family: "Qwen", model: "3.8-Flash-Next", mtp: "rc1：教程 + RN + nightly 配置，K=3", dflash: "main：矩阵未支持", dspark: "main：矩阵未支持", dflash2: "—", evidence: "Qwen3.8-Flash-Next.md；A3/A5 nightly" },
    { family: "Kimi", model: "K3", mtp: "受限：实现和 dummy 测试存在，support matrix 未支持，不能写成真实 checkpoint 已验证", dflash: "—", dspark: "rc1/main：教程 + 配置 + PR；A3 / 950DT 有明确 draft", dflash2: "—", evidence: "Kimi-K3.md；#15851；K3-MRV2-A3.yaml" },
    { family: "Kimi", model: "K3.1 Pro", mtp: "—", dflash: "—", dspark: "main：实验 + PR #15851；GQA DSpark 证据，其他项标受限", dflash2: "—", evidence: "Kimi-K3.1-Pro.md；#15851 / #21549" },
    { family: "GLM", model: "5.3", mtp: "rc1/main：教程 + 配置 + PR；含 MTP3/MTP5 与 PD 示例", dflash: "受限：support matrix 未验证，未找到普通 DFlash 实测", dspark: "受限：release note 和模块文档存在，但 support matrix 状态冲突，draft 未注明", dflash2: "rc1/main：多组合并 PR 实测，含 K5/K7、QuaRot、PP/PCP", evidence: "#17772 / #18717 / #20446 / #21114 / #21630" },
    { family: "GLM", model: "5.3-Flash", mtp: "rc1/main：教程 + CI + PR，含内置 MTP head", dflash: "—", dspark: "—", dflash2: "main：PR #21439，K=7；rc1 未找到对应证据", evidence: "GLM5.3-Flash.md；#16214 / #18931 / #21439" },
    { family: "MiniMax", model: "M3", mtp: "—", dflash: "—", dspark: "rc1：教程 + PR #19537 / #21155；main support matrix 未宣告支持，不写成当前正式能力", dflash2: "—", evidence: "MiniMax-M3.md；#19537 / #21155" }
  ],
  bonusDemo: {
    all: [
      { title: "输入：a₀ 与 4 个候选", text: "a₀ 已确认，d₁–d₄ 由 draft 提出。target 一次前向计算所有位置的 logits。", active: null, logit: [], accepted: [], rejected: [], outputs: [] },
      { title: "a₀ logits → 接受 d₁", text: "a₀ 位置的 logits 验证 d₁，d₁ 通过，输出前缀开始形成。", active: 1, logit: [0], accepted: [1], rejected: [], outputs: [{ text: "d₁", kind: "accepted" }] },
      { title: "d₁ logits → 接受 d₂", text: "d₁ 位置的 logits 验证 d₂，连续前缀变成 d₁、d₂。", active: 2, logit: [1], accepted: [1, 2], rejected: [], outputs: [{ text: "d₁", kind: "accepted" }, { text: "d₂", kind: "accepted" }] },
      { title: "d₂ logits → 接受 d₃", text: "d₂ 位置的 logits 验证 d₃，连续前缀变成 d₁、d₂、d₃。", active: 3, logit: [2], accepted: [1, 2, 3], rejected: [], outputs: [{ text: "d₁", kind: "accepted" }, { text: "d₂", kind: "accepted" }, { text: "d₃", kind: "accepted" }] },
      { title: "d₃ logits → 接受 d₄", text: "d₃ 位置的 logits 验证 d₄，4 个候选全部接受。", active: 4, logit: [3], accepted: [1, 2, 3, 4], rejected: [], outputs: [{ text: "d₁", kind: "accepted" }, { text: "d₂", kind: "accepted" }, { text: "d₃", kind: "accepted" }, { text: "d₄", kind: "accepted" }] },
      { title: "d₄ logits → 额外 bonus", text: "所有候选都接受后，直接利用 d₄ 位置的 logits 预测下一个 Token。4 个候选 + 1 个 bonus，共 5 个，不需要额外一次 target 前向。", active: null, logit: [4], accepted: [1, 2, 3, 4], rejected: [], outputs: [{ text: "d₁", kind: "accepted" }, { text: "d₂", kind: "accepted" }, { text: "d₃", kind: "accepted" }, { text: "d₄", kind: "accepted" }, { text: "bonus", kind: "bonus" }] }
    ],
    reject: [
      { title: "输入：a₀ 与 4 个候选", text: "这条路径观察 d₄ 被拒绝时，为什么在首个拒绝位置截断。", active: null, logit: [], accepted: [], rejected: [], outputs: [] },
      { title: "a₀ logits → 接受 d₁", text: "d₁ 通过验证，成为连续前缀的一部分。", active: 1, logit: [0], accepted: [1], rejected: [], outputs: [{ text: "d₁", kind: "accepted" }] },
      { title: "d₁ logits → 接受 d₂", text: "d₂ 通过验证，当前输出为 d₁、d₂。", active: 2, logit: [1], accepted: [1, 2], rejected: [], outputs: [{ text: "d₁", kind: "accepted" }, { text: "d₂", kind: "accepted" }] },
      { title: "d₂ logits → 接受 d₃", text: "d₃ 通过验证，当前输出为 d₁、d₂、d₃。", active: 3, logit: [2], accepted: [1, 2, 3], rejected: [], outputs: [{ text: "d₁", kind: "accepted" }, { text: "d₂", kind: "accepted" }, { text: "d₃", kind: "accepted" }] },
      { title: "d₃ logits → 拒绝 d₄，产生 c₄", text: "d₄ 未通过。序列在首个拒绝位置截断，产生修正 Token c₄；原 d₄ 之后的 logits 不再用于额外 bonus。3 个接受 + 1 个修正，共 4 个。", active: 4, logit: [3], accepted: [1, 2, 3], rejected: [4], outputs: [{ text: "d₁", kind: "accepted" }, { text: "d₂", kind: "accepted" }, { text: "d₃", kind: "accepted" }, { text: "c₄", kind: "correction" }] }
    ]
  },
  mtpDemo: {
    single: [
      { title: "输入：hₚ + a@(P+1)", text: "M=1 时只有一个 MTP 模块，后续每一步都复用它。", active: null, module: "", outputs: [] },
      { title: "模块 #0 → d₁@P+2", text: "模块 #0 读取 hₚ 与已知 Token，生成第 1 个候选。", active: 0, module: "MTP #0（复用）", outputs: [{ text: "d₁", position: "P+2" }] },
      { title: "再次复用模块 #0 → d₂@P+3", text: "仍然是模块 #0，读取 d₁ 与反馈 hidden，生成第 2 个候选。", active: 1, module: "MTP #0（复用）", outputs: [{ text: "d₁", position: "P+2" }, { text: "d₂", position: "P+3" }] },
      { title: "继续复用模块 #0 → d₃@P+4", text: "同一个模块继续读取 d₂ 与反馈 hidden，生成第 3 个候选。N=3、M=1。", active: 2, module: "MTP #0（复用）", outputs: [{ text: "d₁", position: "P+2" }, { text: "d₂", position: "P+3" }, { text: "d₃", position: "P+4" }] },
      { title: "Target 一次验证", text: "三个串行 draft 步骤完成后，target 才一次验证 d₁、d₂、d₃，而不是验证三次。", active: 3, module: "target verify", outputs: [{ text: "d₁", position: "P+2" }, { text: "d₂", position: "P+3" }, { text: "d₃", position: "P+4" }] }
    ],
    multi: [
      { title: "输入：hₚ + a@(P+1)", text: "M=3 时有三个模块，但它们仍按顺序工作，而不是并行。", active: null, module: "", outputs: [] },
      { title: "模块 #0 → d₁@P+2", text: "模块 #0 先产生第 1 个候选。", active: 0, module: "MTP #0", outputs: [{ text: "d₁", position: "P+2" }] },
      { title: "模块 #1 → d₂@P+3", text: "模块 #1 读取 d₁ 与反馈 hidden，产生第 2 个候选。模块变了，执行仍然串行。", active: 1, module: "MTP #1", outputs: [{ text: "d₁", position: "P+2" }, { text: "d₂", position: "P+3" }] },
      { title: "模块 #2 → d₃@P+4", text: "模块 #2 读取 d₂ 与反馈 hidden，产生第 3 个候选。N=3、M=3。", active: 2, module: "MTP #2", outputs: [{ text: "d₁", position: "P+2" }, { text: "d₂", position: "P+3" }, { text: "d₃", position: "P+4" }] },
      { title: "Target 一次验证", text: "三个不同模块依次完成后，target 才一次验证整组候选。", active: 3, module: "target verify", outputs: [{ text: "d₁", position: "P+2" }, { text: "d₂", position: "P+3" }, { text: "d₃", position: "P+4" }] }
    ]
  },
  dsparkDemo: [
    { title: "Anchor 与四个候选", text: "target 已确认 D，DSpark 生成 E/F/G/H，同时给出 confidence。confidence 与后续 SPS 数值全是教学假设。", active: null, outputs: [] },
    { title: "计算前缀 survival", text: "a₁=.96，a₂=.96×.88=.8448，a₃=.8448×.72=.608256，a₄=.608256×.31=.188559。cₖ 是条件概率，aₖ 才是前缀生存概率。", active: "survival", outputs: [{ text: "a₁ .960000", kind: "metric" }, { text: "a₂ .844800", kind: "metric" }, { text: "a₃ .608256", kind: "metric" }, { text: "a₄ .188559", kind: "metric" }] },
    { title: "初始化：不验证任何 draft", text: "R=1、ℓ=0 时 B=1、τ=1。假设 SPS(1)=100，因此 Θ=1×100=100，作为当前 best。每个请求 baseline 的 1 不能漏掉。", active: "baseline", outputs: [{ text: "B=1", kind: "metric" }, { text: "τ=1", kind: "metric" }, { text: "Θ=100.000", kind: "metric" }] },
    { title: "接纳 E：Θ 改善", text: "ℓ=1：B=2，τ=1+.96=1.96；假设 SPS(2)=60，Θ=1.96×60=117.600>100，更新 best。E 只是 admitted，尚未被 target 接受。", active: "schedule", admitted: 1, outputs: [{ text: "E · admitted", kind: "admitted" }, { text: "B=2", kind: "metric" }, { text: "τ=1.960000", kind: "metric" }, { text: "Θ=117.600", kind: "metric" }] },
    { title: "继续接纳 F：Θ 改善", text: "ℓ=2：B=3，τ=1+.96+.8448=2.8048；SPS(3)=45，Θ=2.8048×45=126.216>117.600，继续更新 best。", active: "schedule", admitted: 2, outputs: [{ text: "EF · admitted", kind: "admitted" }, { text: "B=3", kind: "metric" }, { text: "τ=2.804800", kind: "metric" }, { text: "Θ=126.216", kind: "metric" }] },
    { title: "继续接纳 G：形成当前最优 EFG", text: "ℓ=3：B=4，τ=3.413056；SPS(4)=38，Θ=3.413056×38=129.696128>126.216，更新 best 为 EFG。G 仍可能被后续验证拒绝。", active: "schedule", admitted: 3, outputs: [{ text: "EFG · admitted", kind: "admitted" }, { text: "B=4", kind: "metric" }, { text: "τ=3.413056", kind: "metric" }, { text: "Θ=129.696", kind: "metric" }] },
    { title: "尝试 H：Θ 下降，early stop", text: "ℓ=4：B=5，τ=3.60161536；SPS(5)=25，Θ=90.040384≤129.696128。理论 Algorithm 1 立即 break，保留 EFG；H 是 scheduler dropped，不是 target rejected。", active: "stop", admitted: 3, outputs: [{ text: "ℓ*=3 · EFG", kind: "admitted" }, { text: "H · dropped", kind: "dropped" }, { text: "Θ=90.040", kind: "metric" }] },
    { title: "Target 验证：G 被拒绝 → 生成 G*", text: "调度只决定谁进入验证。target 实际接受 E/F、拒绝 G，并在首个拒绝位置生成修正 Token G*；不继续采用 H，G* 也不是 bonus。", active: "verify", outputs: [{ text: "E", kind: "accepted" }, { text: "F", kind: "accepted" }, { text: "G*", kind: "correction" }] }
  ],
  selectorDemo: [
    { title: "并行形成 top-C 候选格", text: "教学演示将三个位置分别保留为 C=3；官方方法为 top-16。独立 top-1 会连续选择 decoding，selector 需要沿条件边找到另一条路径。", active: null, outputs: [] },
    { title: "从 anchor for 条件化选择 speculative", text: "selector 评估 for 到第一位各候选的边，加入 unary 与前序条件转移分数，选择 speculative。", active: 1, outputs: [{ text: "speculative", kind: "admitted" }] },
    { title: "speculative → decoding：沿条件边选路", text: "上一步选择 speculative 后，只读取它对应的下一条边行，选择 decoding。这里的 decoding 不再是对上一位 decoding 的重复。", active: 2, outputs: [{ text: "speculative", kind: "admitted" }, { text: "decoding", kind: "admitted" }] },
    { title: "decoding → <eos>：完成一次 walk", text: "继续沿 decoding 的条件边选择 <eos>。得到的是逐步 walk，不是对全部 C^K 路径求全局最优。", active: 3, outputs: [{ text: "speculative", kind: "admitted" }, { text: "decoding", kind: "admitted" }, { text: "<eos>", kind: "admitted" }] },
    { title: "把 sparse q 交给 rejection sampler", text: "保存实际 predecessor 边行的全部 C 个分数，top-C 集合之外才保持 -inf。target forward 只读取 Token 路径并产生 p；概率 rejection sampler 再使用 p 与 sparse q。", active: "verify", outputs: [{ text: "speculative", kind: "admitted" }, { text: "decoding", kind: "admitted" }, { text: "<eos>", kind: "admitted" }] }
  ]
};
