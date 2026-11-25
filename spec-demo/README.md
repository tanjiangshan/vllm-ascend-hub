# vLLM Ascend 投机推理技术图鉴（V2）

一套可离线阅读的技术文档与交互图，覆盖 MTP、DFlash、DSpark、DFlash2 的算法结构、公开 NPU 证据与昇腾部署。

## 打开

在线版：<https://tanjiangshan.github.io/vllm-ascend-hub/spec-demo/>

本地版：直接用 Chrome 或 Edge 打开 `index.html`。不需要 HTTP 服务、Node、Python、CDN、在线字体或其他远程资源。

## 发布

本站是聚合站 `tanjiangshan/vllm-ascend-hub` 的子目录，与门户页一起由 GitHub Pages 托管。在 `vllm-learn` 仓库根目录执行：

```bash
scripts/deploy-hub.sh spec-demo
```

脚本以浅克隆方式拉取远端、rsync 同步门户与本目录后提交推送，只同步指定 demo，不影响其他子站。

`.nojekyll` 用于关闭 Jekyll 处理，保持资源按原样发布。

## 内容结构

1. 投机推理的概念、问题与验证语义
2. 方法演进与家族
3. MTP
4. DFlash
5. DSpark
6. DFlash2
7. 方法对照：classic MTP 串行基线、DFlash 块并行，以及 DSpark / DFlash2 两条改进分支
8. 收益与成本：AL、TPOT、ITL、四方法账本与负载边界
9. 版本支持
10. 昇腾部署与验收

模型范围只覆盖当前新部署常见系列：DeepSeek V4.1、Qwen3.8、Kimi K3/K3.1、GLM-5.3/5.3-Flash、MiniMax-M3。旧模型收益不作为主线数据。

## 交互

- 第 1 章：全部接受与 d₄ 被拒绝的验证流程。
- 第 3 章：Gloeckle Figure 1 与 DeepSeek-V3 Figure 3 原图、原始并行多头与 sequential MTP 对照、单模块内部结构，以及 M=1 复用与 M=3 链式演示。
- 第 4 章：DFlash Figure 2 原图、target context 逐层 KV 注入、anchor/mask 单次块生成与训练/推理对照。
- 第 5 章：论文 Figure 1 原图、本地半自回归结构细图，以及可复算 confidence、survival、SPS(B) 与前缀调度的 8 步演示。
- 第 6 章：Inco 官方 Figure 1 selector 与 Figure 4 two-tap conv 原图、候选格/边评分/局部卷积拆解，以及官方 Token 示例的 selector walk。
- 第 7 章：classic MTP → DFlash → DSpark / DFlash2 的分支总图、四方法改进对照与共同边界。
- 第 8 章：AL 与稳态成本口径、vLLM 官方 TPOT/ITL bundled-token 原图、四方法成本账本，以及 K、并发、长上下文与 PD 的收益边界。
- 第 9 章：版本与模型证据矩阵；#19512 同场景指标和 #21439 分实验表格，明确哪些公开数据不能用于排名、归因或计算普通 AR 加速比。
- 第 10 章：配置、K/PD、TPOT/ITL 验收、profiler 归因与回退检查。
- 章节导航、阅读进度、折叠区、代码复制、浅色打印。
- 顶部“切换浅色 / 切换暗色”按钮：默认暗色，可切换浅色；打印统一使用浅色主题。

## 离线约束

- 所有 CSS、JS、SVG、字体均为本地相对路径；
- 不使用 `fetch`、ES Module 动态加载、CDN 或在线字体；
- Noto Sans SC 可变字体和 OFL 许可证随包提供；
- 外部链接只用于溯源，不影响页面运行。

## 验证方式

不要通过禁用网卡或断开远程机器网络验证。建议：

1. 静态扫描外部依赖；
2. 浏览器自动化只拦截 HTTP/HTTPS 请求，模拟外部资源不可用；
3. 整目录复制到其他路径，以 `file://` 打开并检查导航、图形和交互；
4. 检查打印预览，确认折叠区与静态回退表均展开。

## 文件

```text
spec-demo/
├── .nojekyll
├── index.html
├── css/style.css
├── js/data.js
├── js/app.js
├── assets/diagrams/mtp-gloeckle-2024-figure1.png
├── assets/diagrams/mtp-deepseek-v3-figure3.svg
├── assets/diagrams/dflash-figure2-inference-design.svg
├── assets/diagrams/dspark-figure1-architecture.svg
├── assets/diagrams/dflash2-figure1-selector.svg
├── assets/diagrams/dflash2-figure4-two-tap-conv.svg
├── assets/diagrams/latency-metrics-speculative-decoding-light.svg
├── assets/diagrams/latency-metrics-speculative-decoding-dark.svg
├── assets/fonts/noto-sans-sc/
└── README.md
```
