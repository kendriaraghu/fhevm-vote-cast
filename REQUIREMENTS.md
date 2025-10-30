# FHEVoteCast - 隐私保护问卷调查平台

## 项目概述

**项目名称**: FHEVoteCast  
**项目类型**: 基于FHEVM的隐私保护问卷调查dApp  
**技术栈**: Solidity + FHEVM + Next.js + TypeScript  
**目标网络**: Sepolia测试网 + 本地开发  

## 核心特性

### 🔐 隐私保护
- 使用FHEVM全同态加密技术保护问卷数据
- 评分和统计信息完全加密存储
- 只有问卷创建者可解密查看结果
- 参与者无法看到他人评分

### 📊 智能统计
- 实时加密评分统计
- 可视化图表展示（柱状图、饼图、趋势图）
- 支持多种评分类型（1-5星、1-10分、A-F等级）
- 自动生成统计报告

### 🎯 功能模块

#### 1. 问卷管理
- **创建问卷**: 设置标题、描述、评分类型、截止时间
- **编辑问卷**: 修改问卷信息（仅创建者）
- **删除问卷**: 软删除机制
- **问卷状态**: 草稿/进行中/已结束

#### 2. 参与系统
- **参与问卷**: 加密提交评分
- **防重复**: 每个地址只能参与一次
- **匿名性**: 评分完全匿名化

#### 3. 数据统计
- **实时统计**: 加密状态下的评分统计
- **图表展示**: 多种可视化图表
- **导出功能**: 统计报告导出

#### 4. 用户中心
- **我的创建**: 管理自己创建的问卷
- **我的参与**: 查看参与过的问卷
- **历史记录**: 完整的操作历史

## 技术架构

### 智能合约层
```solidity
contract FHEVoteCast {
    // 问卷结构
    struct Survey {
        address creator;
        string title;
        string description;
        SurveyType surveyType;
        uint256 endTime;
        bool isActive;
        euint32 totalResponses;    // 加密的总参与数
        euint32 averageScore;      // 加密的平均分
        mapping(address => bool) hasVoted;
    }
    
    // 评分类型
    enum SurveyType { 
        STAR_5,      // 1-5星
        SCORE_10,    // 1-10分
        GRADE_ABC    // A-F等级
    }
    
    // 核心功能
    function createSurvey(...) external;
    function participateSurvey(uint256 surveyId, inEuint32 calldata encryptedScore) external;
    function getSurveyStats(uint256 surveyId) external view returns (euint32, euint32);
    function decryptResults(uint256 surveyId) external view returns (uint32, uint32);
}
```

### 前端架构
```
fhevm-vote-cast-frontend/
├── app/
│   ├── page.tsx              # 欢迎页
│   ├── dashboard/            # 仪表板
│   ├── create/               # 创建问卷
│   ├── participate/          # 参与问卷
│   ├── my-surveys/           # 我的问卷
│   └── analytics/            # 统计分析
├── components/
│   ├── SurveyCard.tsx        # 问卷卡片
│   ├── RatingInput.tsx       # 评分输入
│   ├── StatsChart.tsx        # 统计图表
│   └── WalletConnect.tsx     # 钱包连接
├── hooks/
│   ├── useSurvey.tsx         # 问卷操作
│   ├── useAnalytics.tsx      # 统计分析
│   └── useWallet.tsx         # 钱包管理
└── fhevm/
    ├── fhevm.ts              # FHEVM实例
    ├── loader.ts             # SDK加载
    └── constants.ts           # 常量配置
```

## 页面设计

### 1. 欢迎页 (Landing Page)
- **Hero区域**: 项目介绍 + 主要特性
- **功能展示**: 核心功能卡片
- **快速开始**: 创建问卷按钮
- **统计概览**: 平台数据展示

### 2. 导航栏 (Navigation)
- **Logo**: FHEVoteCast品牌标识
- **主导航**: 首页/创建/参与/我的/统计
- **钱包状态**: 连接状态 + 地址显示
- **用户菜单**: 个人中心/设置/退出

### 3. 问卷创建页
- **基本信息**: 标题、描述、类型选择
- **时间设置**: 开始时间、结束时间
- **预览功能**: 实时预览问卷效果
- **发布按钮**: 创建并发布问卷

### 4. 问卷参与页
- **问卷信息**: 标题、描述、类型
- **评分界面**: 根据类型显示不同评分组件
- **提交确认**: 确认提交加密评分
- **状态反馈**: 提交成功/失败提示

### 5. 统计分析页
- **概览卡片**: 总问卷数、总参与数、平均分
- **图表区域**: 多种统计图表
- **筛选功能**: 按时间、类型筛选
- **导出功能**: 下载统计报告

## 设计系统

### 主题选型
- **设计体系**: Glassmorphism（毛玻璃效果）
- **色彩方案**: E组 (Purple/Deep Purple/Indigo) - 奢华神秘风格
- **排版系统**: Sans-Serif (Inter) - 1.25倍率
- **布局模式**: Sidebar（左侧边栏）
- **组件风格**: 大圆角(16px) + 大阴影 + 细边框(1px)
- **动效时长**: 平滑 (300ms)

### 色彩方案
```typescript
const colors = {
  primary: '#A855F7',        // Purple
  secondary: '#7C3AED',      // Deep Purple  
  accent: '#6366F1',         // Indigo
  background: '#FFFFFF',     // 白色背景
  surface: '#F8FAFC',        // 浅灰表面
  text: '#0F172A',           // 深色文字
  textSecondary: '#64748B',  // 次要文字
}
```

## 技术实现要点

### FHEVM集成
- 使用`euint32`存储加密评分数据
- 实现`FHE.allow`访问控制
- 支持`FHE.add/sub/mul`等加密运算
- 集成解密签名机制

### 钱包集成
- 支持MetaMask等主流钱包
- 实现钱包持久化连接
- 自动重连机制
- 链切换支持

### 数据可视化
- 使用Chart.js或Recharts
- 支持多种图表类型
- 响应式设计
- 暗色主题支持

## 开发计划

### Phase 1: 核心合约开发
- [ ] 问卷创建合约
- [ ] 参与评分合约  
- [ ] 统计分析合约
- [ ] 访问控制机制

### Phase 2: 前端基础功能
- [ ] 钱包连接
- [ ] 问卷创建界面
- [ ] 参与评分界面
- [ ] 基础统计展示

### Phase 3: 高级功能
- [ ] 数据可视化图表
- [ ] 用户中心
- [ ] 导出功能
- [ ] 响应式优化

### Phase 4: 测试与部署
- [ ] 单元测试
- [ ] 集成测试
- [ ] 测试网部署
- [ ] 用户验收测试

## 验收标准

### 功能验收
- [ ] 可创建、编辑、删除问卷
- [ ] 可参与问卷并提交加密评分
- [ ] 可查看统计图表和数据分析
- [ ] 钱包连接和断开正常
- [ ] 数据持久化和恢复正常

### 技术验收
- [ ] 合约编译和测试通过
- [ ] 前端构建成功
- [ ] 加密→解密闭环完整
- [ ] 响应式设计适配
- [ ] 性能优化达标

### 安全验收
- [ ] 评分数据完全加密
- [ ] 访问控制正确实现
- [ ] 防重复参与机制
- [ ] 数据隐私保护

## 项目文件结构

```
zama_temp_survey/
├── fhevm-hardhat-template/          # 合约开发
│   ├── contracts/
│   │   └── FHEVoteCast.sol         # 主合约
│   ├── test/
│   │   └── FHEVoteCast.test.ts     # 合约测试
│   └── deploy/
│       └── deploy.ts               # 部署脚本
├── fhevm-vote-cast-frontend/        # 前端应用
│   ├── app/                        # Next.js页面
│   ├── components/                 # React组件
│   ├── hooks/                      # 自定义Hooks
│   ├── fhevm/                      # FHEVM集成
│   └── scripts/                    # 构建脚本
└── REQUIREMENTS.md                 # 需求文档
```

---

**项目启动时间**: 2025年1月20日  
**预计完成时间**: 2025年1月25日  
**开发团队**: FHEVM开发团队  
**项目状态**: 需求确认阶段

