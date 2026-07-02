import { ResearchState, CompanyIntel, FinancialData, NewsData, CompetitorData, RiskData, EvidenceCard, Decision } from '../../shared/types.js';

export interface CompanyMockData {
  intel: CompanyIntel;
  financials: FinancialData;
  news: NewsData;
  competitors: CompetitorData;
  risks: RiskData;
  decision: Decision;
}

const BASE_MOCK_DATABASE: Record<string, CompanyMockData> = {
  AAPL: {
    intel: {
      name: 'Apple Inc.',
      ticker: 'AAPL',
      headquarters: 'One Apple Park Way, Cupertino, CA 95014',
      founders: ['Steve Jobs', 'Steve Wozniak', 'Ronald Wayne'],
      founded: '1976',
      ceo: 'Tim Cook',
      industry: 'Consumer Electronics & Software',
      employeeCount: 164000,
      products: ['iPhone', 'iPad', 'Mac', 'Apple Watch', 'Apple TV', 'Apple Vision Pro', 'iOS', 'macOS', 'iCloud', 'Apple Music'],
      businessModel: 'Hardware sales bundled with highly profitable software ecosystem (Services). Focuses on premium pricing, high customer lock-in, and vertical integration of custom silicon (M-series and A-series chips).',
      website: 'https://www.apple.com',
      summary: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories, and sells a variety of related services. The company\'s products are known for premium quality, ease of use, and seamless ecosystem integration. Services revenue from App Store, iCloud, Apple Pay, and subscriptions represents an increasingly vital high-margin growth engine.'
    },
    financials: {
      metrics: {
        revenue: 391035000000,
        netIncome: 93736000000,
        operatingMargin: 30.13,
        debt: 106600000000,
        cashFlow: 110000000000,
        marketCap: 3450000000000,
        eps: 6.16,
        peRatio: 34.2,
        revenueGrowth: 2.02
      },
      formattedMetrics: {
        revenue: { label: 'Revenue (TTM)', value: '$391.04B', type: 'currency', trend: 'up' },
        netIncome: { label: 'Net Income (TTM)', value: '$93.74B', type: 'currency', trend: 'up' },
        operatingMargin: { label: 'Operating Margin', value: '30.13%', type: 'percent', trend: 'up' },
        debt: { label: 'Total Debt', value: '$106.60B', type: 'currency', trend: 'down' },
        cashFlow: { label: 'Free Cash Flow (FCF)', value: '$110.00B', type: 'currency', trend: 'up' },
        marketCap: { label: 'Market Cap', value: '$3.45T', type: 'currency', trend: 'up' },
        eps: { label: 'EPS (Diluted)', value: '$6.16', type: 'number', trend: 'up' },
        peRatio: { label: 'P/E Ratio', value: '34.2', type: 'ratio', trend: 'neutral' },
        revenueGrowth: { label: 'Revenue Growth (YoY)', value: '2.02%', type: 'percent', trend: 'up' }
      },
      historical: [
        { year: '2021', revenue: 365817000000, netIncome: 94680000000, operatingMargin: 29.78 },
        { year: '2022', revenue: 394328000000, netIncome: 99803000000, operatingMargin: 30.29 },
        { year: '2023', revenue: 383285000000, netIncome: 96995000000, operatingMargin: 29.82 },
        { year: '2024', revenue: 391035000000, netIncome: 93736000000, operatingMargin: 30.13 }
      ]
    },
    news: {
      articles: [
        {
          id: 'a1',
          title: 'Apple Unveils iOS 18 with Apple Intelligence Integrations',
          sentiment: 'positive',
          category: 'AI announcements',
          source: 'Bloomberg',
          summary: 'Apple has detailed Apple Intelligence, its new on-device and cloud generative AI framework. The system prioritizes user privacy through Private Cloud Compute, partnering with OpenAI to integrate ChatGPT for general queries while running customized local LLMs for core tasks.',
          date: '2026-06-10',
          url: 'https://www.bloomberg.com/news/apple-intelligence'
        },
        {
          id: 'a2',
          title: 'EU Fines Apple Over App Store Steering Practices',
          sentiment: 'negative',
          category: 'regulations',
          source: 'Reuters',
          summary: 'The European Commission fined Apple €1.84 billion for abusing its dominant position in the distribution of music streaming apps, alleging anti-steering rules prevent developers from informing users about cheaper subscription options outside the app.',
          date: '2026-05-15',
          url: 'https://www.reuters.com/business/eu-apple-fine'
        },
        {
          id: 'a3',
          title: 'Apple Q2 Earnings Beat Estimates Driven by Services Growth',
          sentiment: 'positive',
          category: 'earnings',
          source: 'Wall Street Journal',
          summary: 'Apple reported fiscal second-quarter earnings that beat consensus expectations. Services revenue hit an all-time high of $23.9 billion, representing a 14% growth year-over-year, which helped offset slightly weaker iPhone sales in Greater China.',
          date: '2026-05-02',
          url: 'https://www.wsj.com/apple-earnings-q2'
        },
        {
          id: 'a4',
          title: 'Apple Cancels Long-Running Autonomous Car Project to Refocus on Generative AI',
          sentiment: 'neutral',
          category: 'partnerships',
          source: 'TechCrunch',
          summary: 'Apple has shut down its decadelong Special Projects Group (known as Project Titan) targeting autonomous vehicles. Staff from the unit are being transitioned into Apple\'s generative artificial intelligence division to accelerate consumer-facing AI features.',
          date: '2026-03-27',
          url: 'https://www.techcrunch.com/apple-cancels-car-project'
        }
      ],
      sentimentSummary: {
        positive: 65,
        neutral: 20,
        negative: 15
      }
    },
    competitors: {
      competitors: [
        {
          name: 'Microsoft Corp.',
          ticker: 'MSFT',
          revenue: 245120000000,
          marketCap: 3280000000000,
          profitability: 88,
          valuation: 36.5,
          innovation: 92,
          strengths: ['Cloud dominant (Azure)', 'Enterprise SaaS monopoly', 'First-mover in AI (OpenAI partnership)'],
          weaknesses: ['Higher dependency on corporate spend', 'Less direct consumer hardware affinity']
        },
        {
          name: 'Alphabet Inc.',
          ticker: 'GOOGL',
          revenue: 307390000000,
          marketCap: 2200000000000,
          profitability: 82,
          valuation: 22.8,
          innovation: 90,
          strengths: ['Search engine monopoly', 'YouTube engagement model', 'Google Cloud scale'],
          weaknesses: ['High reliance on ad cycles', 'Laggard perception in AI product monetization']
        },
        {
          name: 'Samsung Electronics',
          ticker: 'SSNLF',
          revenue: 215000000000,
          marketCap: 380000000000,
          profitability: 60,
          valuation: 15.2,
          innovation: 78,
          strengths: ['Diverse semiconductor manufacturing', 'Global volume market share in smartphones'],
          weaknesses: ['Lower operating margins on hardware', 'Weak software ecosystem compared to iOS']
        }
      ],
      comparisonNotes: 'Apple maintains unmatched ecosystem pricing power and high operating margins compared to hardware peers like Samsung. While Microsoft possesses a stronger immediate cloud/enterprise growth narrative, Apple\'s consumer device footprint (1.5B+ active iPhones) creates a massive captive audience for its upcoming AI services rollout.'
    },
    risks: {
      risks: [
        {
          category: 'Regulatory',
          severity: 'High',
          explanation: 'Increased global antitrust scrutiny (US DOJ, EU Digital Markets Act) threatens Apple\'s high-margin App Store commission model (15-30%) and default search engine payment agreements (such as the multi-billion deal with Google).',
          mitigation: 'Diversifying services into advertising, financial services (Apple Card), and subscription bundles, while implementing region-specific alternative app stores (such as in the EU).'
        },
        {
          category: 'Competition',
          severity: 'Medium',
          explanation: 'Intense competition in the Chinese premium smartphone segment from local competitors (such as Huawei), alongside slower global smartphone replacement cycles.',
          mitigation: 'Refining device trade-in programs, expanding aggressively in emerging markets (such as India), and introducing new product categories like Apple Vision Pro.'
        },
        {
          category: 'Supply Chain',
          severity: 'Medium',
          explanation: 'Concentration of manufacturing facilities in China exposes Apple to geopolitical tensions, logistics bottlenecks, and localized supply chain disruptions.',
          mitigation: 'Gradually shifting assembly lines and production hubs to India, Vietnam, and Brazil to diversify geographic dependencies.'
        },
        {
          category: 'Technology',
          severity: 'Medium',
          explanation: 'Risk of lagging behind competitors (like Microsoft/OpenAI and Google) in generative AI product execution and consumer feature adoption.',
          mitigation: 'Integrating Apple Intelligence directly into the operating system at the silicon level, combining proprietary localized models with cloud API integrations.'
        }
      ],
      overallScore: 42
    },
    decision: {
      recommendation: 'Buy',
      confidence: 85,
      reasoning: [
        'Unmatched consumer lock-in: The iOS ecosystem exhibits an industry-leading retention rate of >90%, securing a reliable, recurring software monetization base.',
        'High-margin Services expansion: Services revenue continues to grow double-digits (14% YoY) and carries gross margins exceeding 70%, boosting overall profitability.',
        'Capital Allocation: Unparalleled balance sheet strength ($150B+ in cash/marketable securities) supports aggressive share repurchases ($110B authorized) and a growing dividend.',
        'Generative AI Catalyst: On-device "Apple Intelligence" rolling out across the user base will likely spark an iPhone upgrade supercycle over the next 18-24 months.'
      ],
      keyStrengths: [
        'Ecosystem lock-in and premium brand pricing power.',
        'Extremely robust free cash flow generation (>=$100B annually).',
        'Proprietary Apple Silicon providing hardware/software co-optimization.'
      ],
      keyRisks: [
        'Antitrust litigation seeking to break up App Store payment control.',
        'Geopolitical exposure of China supply lines and manufacturing hubs.',
        'Premium hardware market saturation.'
      ],
      futureOutlook: 'Apple is well-positioned to maintain its cash-cow hardware empire while scaling high-margin services. The launch of localized Apple Intelligence features will act as a pivotal consumer demand catalyst. While regulatory battles pose structural headwinds to the App Store billing system, Apple\'s brand loyalty and ecosystem expansion should mitigate severe long-term valuation downside.'
    }
  },
  MSFT: {
    intel: {
      name: 'Microsoft Corporation',
      ticker: 'MSFT',
      headquarters: 'One Microsoft Way, Redmond, WA 98052',
      founders: ['Bill Gates', 'Paul Allen'],
      founded: '1975',
      ceo: 'Satya Nadella',
      industry: 'Enterprise Software & Cloud Computing',
      employeeCount: 228000,
      products: ['Azure Cloud', 'Microsoft 365 (Office)', 'Windows OS', 'LinkedIn', 'Xbox', 'Microsoft Copilot', 'GitHub', 'Surface PC', 'SQL Server'],
      businessModel: 'B2B enterprise licensing, hybrid cloud services, subscription-based productivity software (SaaS), search advertising, and gaming subscriptions (Xbox Game Pass). Highly diversified across corporate and consumer sectors.',
      website: 'https://www.microsoft.com',
      summary: 'Microsoft Corporation is a global technology giant that provides cloud computing, software, devices, and solutions. Under Satya Nadella\'s leadership, the company transformed into a cloud-first power. It is now leading the AI race through its deep partnership with OpenAI, integrating Copilot models across its vast productivity suite and scaling Azure\'s AI infrastructure.'
    },
    financials: {
      metrics: {
        revenue: 245120000000,
        netIncome: 88140000000,
        operatingMargin: 44.58,
        debt: 44900000000,
        cashFlow: 74000000000,
        marketCap: 3280000000000,
        eps: 11.80,
        peRatio: 36.5,
        revenueGrowth: 15.6
      },
      formattedMetrics: {
        revenue: { label: 'Revenue (TTM)', value: '$245.12B', type: 'currency', trend: 'up' },
        netIncome: { label: 'Net Income (TTM)', value: '$88.14B', type: 'currency', trend: 'up' },
        operatingMargin: { label: 'Operating Margin', value: '44.58%', type: 'percent', trend: 'up' },
        debt: { label: 'Total Debt', value: '$44.90B', type: 'currency', trend: 'down' },
        cashFlow: { label: 'Free Cash Flow (FCF)', value: '$74.00B', type: 'currency', trend: 'up' },
        marketCap: { label: 'Market Cap', value: '$3.28T', type: 'currency', trend: 'up' },
        eps: { label: 'EPS (Diluted)', value: '$11.80', type: 'number', trend: 'up' },
        peRatio: { label: 'P/E Ratio', value: '36.5', type: 'ratio', trend: 'neutral' },
        revenueGrowth: { label: 'Revenue Growth (YoY)', value: '15.60%', type: 'percent', trend: 'up' }
      },
      historical: [
        { year: '2021', revenue: 168088000000, netIncome: 61271000000, operatingMargin: 42.14 },
        { year: '2022', revenue: 198270000000, netIncome: 72738000000, operatingMargin: 42.06 },
        { year: '2023', revenue: 211915000000, netIncome: 72361000000, operatingMargin: 41.77 },
        { year: '2024', revenue: 245120000000, netIncome: 88140000000, operatingMargin: 44.58 }
      ]
    },
    news: {
      articles: [
        {
          id: 'm1',
          title: 'Microsoft Azure Revenue Accelerates 31% Driven by AI Services',
          sentiment: 'positive',
          category: 'earnings',
          source: 'WSJ',
          summary: 'Microsoft reported earnings for its latest quarter, with commercial cloud services surging. Azure revenue grew 31% year-over-year, with Satya Nadella highlighting that AI services contributed a significant 7 percentage points of that growth.',
          date: '2026-04-28',
          url: 'https://www.wsj.com/msft-earnings-cloud'
        },
        {
          id: 'm2',
          title: 'FTC Launches In-Depth Antitrust Investigation into Microsoft AI Deals',
          sentiment: 'negative',
          category: 'regulations',
          source: 'Reuters',
          summary: 'The U.S. Federal Trade Commission has opened a broad investigation into Microsoft\'s deals with AI startups, specifically focusing on its hiring of Inflection AI\'s team and its multi-billion dollar partnership with OpenAI to see if they circumvent merger reviews.',
          date: '2026-06-03',
          url: 'https://www.reuters.com/ftc-investigates-microsoft-ai'
        },
        {
          id: 'm3',
          title: 'Microsoft Expands Copilot Pro Tier Globally, Integrating GPT-4o',
          sentiment: 'positive',
          category: 'AI announcements',
          source: 'TechCrunch',
          summary: 'Microsoft has expanded its Copilot Pro premium subscription to 222 countries. The service now operates on OpenAI\'s latest GPT-4o model, enabling faster text, voice, and vision processing directly inside Office apps like Word and Excel.',
          date: '2026-05-19',
          url: 'https://www.techcrunch.com/copilot-pro-gpt-4o'
        }
      ],
      sentimentSummary: {
        positive: 75,
        neutral: 15,
        negative: 10
      }
    },
    competitors: {
      competitors: [
        {
          name: 'Amazon.com Inc. (AWS)',
          ticker: 'AMZN',
          revenue: 574800000000,
          marketCap: 1980000000000,
          profitability: 64,
          valuation: 39.2,
          innovation: 85,
          strengths: ['AWS cloud infrastructure leader', 'Unmatched e-commerce logistics', 'Retail advertising scale'],
          weaknesses: ['Lower consolidated net margins (6-8%) due to retail overhead']
        },
        {
          name: 'Alphabet Inc.',
          ticker: 'GOOGL',
          revenue: 307390000000,
          marketCap: 2200000000000,
          profitability: 82,
          valuation: 22.8,
          innovation: 90,
          strengths: ['Search monopoly engine', 'Google Workspace SaaS base'],
          weaknesses: ['Challenged cloud market share (currently #3 behind AWS and Azure)']
        }
      ],
      comparisonNotes: 'Microsoft holds a dominant position in B2B enterprise software with Office 365, which has very high pricing power. AWS remains the largest cloud infrastructure provider by market share, but Azure is growing faster due to its tight integration with Windows/Active Directory and its OpenAI exclusive hosting partnership.'
    },
    risks: {
      risks: [
        {
          category: 'Regulatory',
          severity: 'Medium',
          explanation: 'Increased scrutiny over artificial intelligence partnerships and acquisitions, potentially limiting Microsoft\'s ability to purchase or exclusively partner with prominent AI developers.',
          mitigation: 'Building out internal AI labs and hiring key talent directly (e.g. Inflection AI acquisition) to reduce reliance on external entities.'
        },
        {
          category: 'Technology',
          severity: 'Medium',
          explanation: 'High capital expenditure requirements: Building out AI data centers requires tens of billions in annual capex, risking margin compression if AI monetization slows down.',
          mitigation: 'Aligning data center expansions to customer commitments and charging premium pricing ($30/user/month) for enterprise Copilot seats.'
        },
        {
          category: 'Competition',
          severity: 'Medium',
          explanation: 'Aggressive pricing and open-source models (like Meta\'s Llama) could commoditize basic LLM capabilities, undercutting Microsoft\'s proprietary Copilot margins.',
          mitigation: 'Offering hybrid solutions, hosting open-source models on Azure, and focusing on proprietary integrations with enterprise corporate data graphs.'
        }
      ],
      overallScore: 35
    },
    decision: {
      recommendation: 'Strong Buy',
      confidence: 92,
      reasoning: [
        'AI Monetization Leader: Unlike competitors, Microsoft has immediate, clear AI revenue streams via its $30/user/month Copilot add-on and commercial Azure AI subscriptions.',
        'High Margin Core: Microsoft maintains a 44% operating margin, providing enormous cash flow to fund massive AI infrastructure capex without threatening financial health.',
        'Enterprise Lock-In: Windows, Active Directory, and Office 365 form an unbreakable foundation in corporate environments, ensuring highly recurring revenues.',
        'Azure Cloud Growth: Azure continues to gain market share against AWS, compounding long-term cloud hosting revenue at scale.'
      ],
      keyStrengths: [
        'SaaS monopoly with Office 365 and enterprise directory services.',
        'Cloud hyperscaler (Azure) expanding margins at scale.',
        'Strategic OpenAI alliance providing first-mover advantage in AI.'
      ],
      keyRisks: [
        'Antitrust scrutiny over AI investments and cloud licensing bundling.',
        'Severe margin compression if massive data center capex does not yield long-term AI demand.',
        'Cybersecurity breaches targeting Microsoft Exchange and cloud infrastructure.'
      ],
      futureOutlook: 'Microsoft represents the safest and most lucrative play in the enterprise software and AI expansion cycle. Satya Nadella has positioned the company to capture value at every layer of the modern tech stack: compute (Azure), platform (OpenAI APIs), and application (Copilot). The core business is highly stable and generates tremendous free cash, funding the transition to AI leadership.'
    }
  },
  GOOGL: {
    intel: {
      name: 'Alphabet Inc.',
      ticker: 'GOOGL',
      headquarters: '1600 Amphitheatre Parkway, Mountain View, CA 94043',
      founders: ['Larry Page', 'Sergey Brin'],
      founded: '1998',
      ceo: 'Sundar Pichai',
      industry: 'Internet Services & Advertising',
      employeeCount: 181000,
      products: ['Google Search', 'YouTube', 'Google Cloud', 'Android', 'Google Maps', 'Chrome', 'Google Gemini', 'Google Pixel', 'Waymo'],
      businessModel: 'Mainly digital advertising (Search, YouTube, Ad Network), enterprise cloud hosting (Google Cloud Platform), subscription services (YouTube Premium/TV), and hardware sales (Pixel phones).',
      website: 'https://abc.xyz',
      summary: 'Alphabet Inc. is a global holding company, with its principal subsidiary being Google. It is the dominant gateway to the web, holding a near-monopoly in search engines and web browsing. Google is driving Gemini, its native multi-modal LLM family, while expanding Waymo (autonomous ride-hailing) and Google Cloud to diversify away from ad revenue.'
    },
    financials: {
      metrics: {
        revenue: 307390000000,
        netIncome: 73795000000,
        operatingMargin: 27.50,
        debt: 28000000000,
        cashFlow: 69000000000,
        marketCap: 2200000000000,
        eps: 5.80,
        peRatio: 22.8,
        revenueGrowth: 8.70
      },
      formattedMetrics: {
        revenue: { label: 'Revenue (TTM)', value: '$307.39B', type: 'currency', trend: 'up' },
        netIncome: { label: 'Net Income (TTM)', value: '$73.79B', type: 'currency', trend: 'up' },
        operatingMargin: { label: 'Operating Margin', value: '27.50%', type: 'percent', trend: 'up' },
        debt: { label: 'Total Debt', value: '$28.00B', type: 'currency', trend: 'neutral' },
        cashFlow: { label: 'Free Cash Flow (FCF)', value: '$69.00B', type: 'currency', trend: 'up' },
        marketCap: { label: 'Market Cap', value: '$2.20T', type: 'currency', trend: 'up' },
        eps: { label: 'EPS (Diluted)', value: '$5.80', type: 'number', trend: 'up' },
        peRatio: { label: 'P/E Ratio', value: '22.8', type: 'ratio', trend: 'down' },
        revenueGrowth: { label: 'Revenue Growth (YoY)', value: '8.70%', type: 'percent', trend: 'up' }
      },
      historical: [
        { year: '2021', revenue: 257637000000, netIncome: 76033000000, operatingMargin: 30.55 },
        { year: '2022', revenue: 282836000000, netIncome: 59972000000, operatingMargin: 26.46 },
        { year: '2023', revenue: 307390000000, netIncome: 73795000000, operatingMargin: 27.50 }
      ]
    },
    news: {
      articles: [
        {
          id: 'g1',
          title: 'Google Introduces Gemini 1.5 Pro with 2-Million Token Context Window',
          sentiment: 'positive',
          category: 'AI announcements',
          source: 'TechCrunch',
          summary: 'Google updated its developer platform with Gemini 1.5 Pro, featuring an industry-leading 2M token context window. The model can process an hour of video, 11 hours of audio, or over 700,000 words in a single prompt, boosting developer tool capabilities.',
          date: '2026-05-14',
          url: 'https://techcrunch.com/google-gemini-1.5'
        },
        {
          id: 'g2',
          title: 'US DOJ Win: Judge Rules Google Search a Monopoly',
          sentiment: 'negative',
          category: 'regulations',
          source: 'Bloomberg',
          summary: 'A federal judge ruled that Google acted illegally to maintain its monopoly in online search, citing its exclusive agreements paying Apple and Samsung to be the default search engine on browsers and devices.',
          date: '2026-05-08',
          url: 'https://www.bloomberg.com/google-search-ruling'
        }
      ],
      sentimentSummary: {
        positive: 55,
        neutral: 25,
        negative: 20
      }
    },
    competitors: {
      competitors: [
        {
          name: 'Microsoft Corp. (Bing)',
          ticker: 'MSFT',
          revenue: 245120000000,
          marketCap: 3280000000000,
          profitability: 88,
          valuation: 36.5,
          innovation: 92,
          strengths: ['AI integration in search', 'Large enterprise sales force'],
          weaknesses: ['Low consumer search share (approx 3-4%)']
        },
        {
          name: 'Meta Platforms Inc.',
          ticker: 'META',
          revenue: 134900000000,
          marketCap: 1250000000000,
          profitability: 78,
          valuation: 26.2,
          innovation: 88,
          strengths: ['Social media advertising monopoly', 'High user attention metrics'],
          weaknesses: ['Dependent on third-party mobile OS tracking changes']
        }
      ],
      comparisonNotes: 'Google maintains a >90% global market share in search advertising. While Microsoft Bing integrated GPT models first, Bing has failed to capture meaningful search market share, highlighting Google\'s powerful user habit and distribution networks.'
    },
    risks: {
      risks: [
        {
          category: 'Regulatory',
          severity: 'High',
          explanation: 'The US DOJ antitrust ruling against Google Search defaults could force Google to terminate default contracts, risking a 10-15% drop in mobile search traffic.',
          mitigation: 'Ramping up direct brand loyalty and organic Android integrations while expanding Google Cloud and subscriptions.'
        },
        {
          category: 'Technology',
          severity: 'Medium',
          explanation: 'AI search answers (Search Generative Experience) could displace traditional high-value link ads, reducing search click-through rates and ad inventory.',
          mitigation: 'Testing new conversational ad placements directly inside generative AI responses.'
        }
      ],
      overallScore: 55
    },
    decision: {
      recommendation: 'Buy',
      confidence: 78,
      reasoning: [
        'Valuation Discount: At ~23x forward earnings, Alphabet trades at a significant discount to peers Microsoft (36x) and Apple (34x), offering a strong margin of safety.',
        'Google Cloud Inflection: GCP is highly profitable, growing >25% and scaling to handle enterprise LLM compute demands.',
        'AI Engineering Scale: Google possesses the most robust end-to-end AI research lab (Google DeepMind) and custom chip architecture (TPUs), reducing cloud AI margins cost.'
      ],
      keyStrengths: [
        'Search engine near-monopoly and YouTube ad dominance.',
        'High-growth, highly profitable Google Cloud segment.',
        'Custom TPU chips offering cost-effective AI training and inference.'
      ],
      keyRisks: [
        'DOJ antitrust remedies (possible breakup or restriction on default distribution).',
        'AI search answers cannibalizing traditional search ad click revenues.',
        'Rising capital expenditures on data centers.'
      ],
      futureOutlook: 'Alphabet remains a digital advertising cash cow, and its cloud services have reached structural profitability. The antitrust ruling is a major headwind, but legal appeals will take years, and Google\'s distribution advantage is sticky. Given the discount valuation relative to big tech peers and its premier AI intellectual property, Alphabet offers an attractive risk-reward profile.'
    }
  },
  TSLA: {
    intel: {
      name: 'Tesla, Inc.',
      ticker: 'TSLA',
      headquarters: '1 Tesla Road, Austin, TX 78725',
      founders: ['Martin Eberhard', 'Marc Tarpenning', 'Elon Musk', 'JB Straubel', 'Ian Wright'],
      founded: '2003',
      ceo: 'Elon Musk',
      industry: 'Electric Vehicles & Clean Energy',
      employeeCount: 140000,
      products: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck', 'Full Self-Driving (FSD)', 'Powerwall', 'Megapack', 'Solar Roof', 'Optimus Bot'],
      businessModel: 'Direct-to-consumer EV sales and servicing, selling energy storage products to utility and residential customers, and software subscription licensing (FSD). Vertical integration of batteries and software.',
      website: 'https://www.tesla.com',
      summary: 'Tesla, Inc. designs, develops, manufactures, sells, and leases fully electric vehicles, energy generation, and storage systems. Tesla is leading the transition to clean energy, but is increasingly positioning itself as an AI and robotics company, focusing on autonomous driving (FSD), robotaxis, and humanoid robotics (Optimus).'
    },
    financials: {
      metrics: {
        revenue: 96773000000,
        netIncome: 14974000000,
        operatingMargin: 9.20,
        debt: 5500000000,
        cashFlow: 4500000000,
        marketCap: 680000000000,
        eps: 4.30,
        peRatio: 65.4,
        revenueGrowth: -3.50
      },
      formattedMetrics: {
        revenue: { label: 'Revenue (TTM)', value: '$96.77B', type: 'currency', trend: 'down' },
        netIncome: { label: 'Net Income (TTM)', value: '$14.97B', type: 'currency', trend: 'down' },
        operatingMargin: { label: 'Operating Margin', value: '9.20%', type: 'percent', trend: 'down' },
        debt: { label: 'Total Debt', value: '$5.50B', type: 'currency', trend: 'neutral' },
        cashFlow: { label: 'Free Cash Flow (FCF)', value: '$4.50B', type: 'currency', trend: 'down' },
        marketCap: { label: 'Market Cap', value: '$680.00B', type: 'currency', trend: 'down' },
        eps: { label: 'EPS (Diluted)', value: '$4.30', type: 'number', trend: 'down' },
        peRatio: { label: 'P/E Ratio', value: '65.4', type: 'ratio', trend: 'up' },
        revenueGrowth: { label: 'Revenue Growth (YoY)', value: '-3.50%', type: 'percent', trend: 'down' }
      },
      historical: [
        { year: '2021', revenue: 53823000000, netIncome: 5519000000, operatingMargin: 12.12 },
        { year: '2022', revenue: 81462000000, netIncome: 12587000000, operatingMargin: 16.76 },
        { year: '2023', revenue: 96773000000, netIncome: 14974000000, operatingMargin: 9.20 }
      ]
    },
    news: {
      articles: [
        {
          id: 't1',
          title: 'Tesla Announces Robotaxi Unveil Event Set for Late 2026',
          sentiment: 'positive',
          category: 'AI announcements',
          source: 'Reuters',
          summary: 'Elon Musk announced that Tesla will officially reveal its dedicated Robotaxi (Cybercab) platform. The vehicle will operate on Tesla\'s end-to-end neural network FSD software, aiming to establish a commercial autonomous ride-hailing network.',
          date: '2026-04-12',
          url: 'https://reuters.com/tesla-robotaxi'
        },
        {
          id: 't2',
          title: 'Tesla Earnings Squeeze as Price Cuts Hit Profit Margins',
          sentiment: 'negative',
          category: 'earnings',
          source: 'WSJ',
          summary: 'Tesla\'s operating margins fell below 10% for the fiscal year as aggressive price cuts in the US and China failed to stimulate matching volume growth, highlighting an intense price war in the global EV market.',
          date: '2026-01-24',
          url: 'https://wsj.com/tesla-earnings'
        }
      ],
      sentimentSummary: {
        positive: 40,
        neutral: 20,
        negative: 40
      }
    },
    competitors: {
      competitors: [
        {
          name: 'BYD Company Ltd.',
          ticker: 'BYDDY',
          revenue: 85000000000,
          marketCap: 98000000000,
          profitability: 45,
          valuation: 18.5,
          innovation: 75,
          strengths: ['Lower cost battery vertical integration', 'Dominance in domestic Chinese EV volume'],
          weaknesses: ['Low brand recognition in Western premium markets']
        },
        {
          name: 'Toyota Motor Corp.',
          ticker: 'TM',
          revenue: 290000000000,
          marketCap: 280000000000,
          profitability: 50,
          valuation: 9.8,
          innovation: 65,
          strengths: ['Hybrid vehicle sales dominance', 'Extremely high manufacturing scale'],
          weaknesses: ['Lagging in pure battery electric vehicle (BEV) rollout']
        }
      ],
      comparisonNotes: 'BYD has overtaken Tesla in raw volume of hybrid/battery sales globally. Tesla still maintains a valuation premium due to its autonomous driving software potential, supercharger network, and energy storage division.'
    },
    risks: {
      risks: [
        {
          category: 'Competition',
          severity: 'High',
          explanation: 'Overcapacity and price wars in the Chinese EV market from highly efficient local competitors (BYD, Xiaomi, Geely) pressuring vehicle average selling prices.',
          mitigation: 'Developing a next-generation lower-cost model ($25k target) and expanding non-automotive energy storage segments.'
        },
        {
          category: 'Technology',
          severity: 'High',
          explanation: 'FSD regulatory approval delays: If regulatory authorities delay commercial ride-hailing deployment, Tesla\'s high-multiple valuation could compress.',
          mitigation: 'Aggressively collecting real-world driving miles from its consumer fleet to prove statistical safety compared to human drivers.'
        }
      ],
      overallScore: 68
    },
    decision: {
      recommendation: 'Watch',
      confidence: 62,
      reasoning: [
        'Margin Pressure: Automotive margins have compressed significantly, moving Tesla away from high-margin luxury software metrics toward typical auto manufacturer margins.',
        'AI Valuation Premium: Tesla\'s market cap (~$680B) cannot be justified by vehicle sales alone; it requires successful monetization of FSD and Optimus robotics.',
        'Slowing EV Growth: Global EV adoption has slowed, forcing Tesla to offer financing incentives and price cuts that hurt profitability.',
        'Energy Storage Bright Spot: The Tesla Megapack energy division is growing rapidly (>100% YoY) and carries healthy utility-scale margins.'
      ],
      keyStrengths: [
        'Global brand recognition and proprietary supercharger infrastructure.',
        'Massive real-world driving database for autonomous neural net training.',
        'High-growth energy storage utility segment.'
      ],
      keyRisks: [
        'Intense EV price competition, particularly from Chinese manufacturers.',
        'Over-dependence on FSD/Robotaxi timeline to maintain high stock multiples.',
        'Key-man risk associated with CEO Elon Musk\'s attention span.'
      ],
      futureOutlook: 'Tesla is transitioning from an EV car company to a robotics/autonomous driving provider. While its energy storage segment represents a major growth catalyst, near-term automotive profitability will remain under pressure due to BYD\'s market share gains. Investors should monitor FSD safety milestones and low-cost platform release timelines closely before buying, placing the stock on a "Watch" list.'
    }
  },
  NVDA: {
    intel: {
      name: 'NVIDIA Corporation',
      ticker: 'NVDA',
      headquarters: '2788 San Tomas Expressway, Santa Clara, CA 95051',
      founders: ['Jensen Huang', 'Chris Malachowsky', 'Curtis Priem'],
      founded: '1993',
      ceo: 'Jensen Huang',
      industry: 'Semiconductors & AI Hardware',
      employeeCount: 296000,
      products: ['Hopper GPUs (H100, H200)', 'Blackwell GPUs (B200)', 'CUDA Software Platform', 'GeForce RTX Graphics', 'DGX Systems', 'Drive Thor (Automotive)', 'Mellanox Networking'],
      businessModel: 'Design and sale of high-performance graphics processing units (GPUs) and integrated AI supercomputing hardware/software solutions. Fabless model: designs chips but outsources manufacturing to TSMC.',
      website: 'https://www.nvidia.com',
      summary: 'NVIDIA Corporation is the pioneer of GPU-accelerated computing. Originally focusing on gaming graphics, the company revolutionized the tech industry by creating CUDA, a software platform that transformed GPUs into general-purpose processors. NVIDIA is the near-monopoly provider of the hardware chips powering the generative AI revolution, controlling >90% of the datacenter AI chip market.'
    },
    financials: {
      metrics: {
        revenue: 96310000000,
        netIncome: 53000000000,
        operatingMargin: 55.03,
        debt: 8500000000,
        cashFlow: 39000000000,
        marketCap: 3100000000000,
        eps: 2.12,
        peRatio: 58.5,
        revenueGrowth: 125.0
      },
      formattedMetrics: {
        revenue: { label: 'Revenue (TTM)', value: '$96.31B', type: 'currency', trend: 'up' },
        netIncome: { label: 'Net Income (TTM)', value: '$53.00B', type: 'currency', trend: 'up' },
        operatingMargin: { label: 'Operating Margin', value: '55.03%', type: 'percent', trend: 'up' },
        debt: { label: 'Total Debt', value: '$8.50B', type: 'currency', trend: 'neutral' },
        cashFlow: { label: 'Free Cash Flow (FCF)', value: '$39.00B', type: 'currency', trend: 'up' },
        marketCap: { label: 'Market Cap', value: '$3.10T', type: 'currency', trend: 'up' },
        eps: { label: 'EPS (Split-Adjusted)', value: '$2.12', type: 'number', trend: 'up' },
        peRatio: { label: 'P/E Ratio', value: '58.5', type: 'ratio', trend: 'up' },
        revenueGrowth: { label: 'Revenue Growth (YoY)', value: '125.00%', type: 'percent', trend: 'up' }
      },
      historical: [
        { year: '2021', revenue: 26974000000, netIncome: 9752000000, operatingMargin: 37.03 },
        { year: '2022', revenue: 26974000000, netIncome: 4368000000, operatingMargin: 20.91 },
        { year: '2023', revenue: 60922000000, netIncome: 29760000000, operatingMargin: 48.85 },
        { year: '2024', revenue: 96310000000, netIncome: 53000000000, operatingMargin: 55.03 }
      ]
    },
    news: {
      articles: [
        {
          id: 'n1',
          title: 'NVIDIA Blackwell Ultra Chips Scheduled for Late 2026 Production',
          sentiment: 'positive',
          category: 'AI announcements',
          source: 'Bloomberg',
          summary: 'Jensen Huang announced the architecture path for Blackwell Ultra and the next-generation "Rubin" AI GPU platform. Rubin will utilize advanced HBM4 memory and custom TSMC packaging to double LLM training throughput.',
          date: '2026-06-02',
          url: 'https://www.bloomberg.com/nvidia-rubin-gpu'
        },
        {
          id: 'n2',
          title: 'US Restricts Further High-End Chip Exports to Middle East Markets',
          sentiment: 'negative',
          category: 'regulations',
          source: 'Reuters',
          summary: 'The Biden administration expanded licensing requirements for Nvidia\'s advanced H100 and Blackwell chips in the Middle East, citing fears that regional cloud operators could resell access to Chinese state research centers.',
          date: '2026-05-24',
          url: 'https://reuters.com/us-chip-restrictions'
        }
      ],
      sentimentSummary: {
        positive: 80,
        neutral: 10,
        negative: 10
      }
    },
    competitors: {
      competitors: [
        {
          name: 'Advanced Micro Devices (AMD)',
          ticker: 'AMD',
          revenue: 22680000000,
          marketCap: 250000000000,
          profitability: 48,
          valuation: 44.2,
          innovation: 82,
          strengths: ['Competitive MI300X AI GPU offerings', 'Strong CPU server market share'],
          weaknesses: ['Smaller software developer ecosystem compared to CUDA']
        },
        {
          name: 'Intel Corp.',
          ticker: 'INTC',
          revenue: 54000000000,
          marketCap: 130000000000,
          profitability: 25,
          valuation: 28.5,
          innovation: 60,
          strengths: ['Internal assembly and foundry fabs', 'Legacy PC chip volume'],
          weaknesses: ['Severe server chip market share losses, high debt burden']
        }
      ],
      comparisonNotes: 'NVIDIA\'s primary moat is the CUDA software layer, which developers have integrated for 15+ years. AMD\'s MI300X chips offer competitive raw performance on paper, but translation layers (ROCm) still suffer from software integration hurdles, keeping NVIDIA in a pricing power monopoly.'
    },
    risks: {
      risks: [
        {
          category: 'Supply Chain',
          severity: 'High',
          explanation: 'Extreme manufacturing concentration: Nvidia is completely dependent on TSMC in Taiwan for advanced CoWoS chip packaging, making it highly vulnerable to geopolitical conflict or natural disasters.',
          mitigation: 'Securing multi-billion advance payments for TSMC capacity and exploring Intel Foundry Services/Samsung packaging facilities.'
        },
        {
          category: 'Regulatory',
          severity: 'Medium',
          explanation: 'US Department of Commerce export controls restricting Nvidia from selling custom scaled-down chips (like H20/B20) to China, a market representing ~15-20% of historic revenue.',
          mitigation: 'Customizing specialized local compliance versions for export and scaling datacenter sales in North America and sovereign clouds in Europe.'
        }
      ],
      overallScore: 48
    },
    decision: {
      recommendation: 'Strong Buy',
      confidence: 90,
      reasoning: [
        'Hypergrowth & Margin: 125% year-over-year growth paired with a 55% operating margin is unprecedented in semiconductor history, generating immense cash flow.',
        'CUDA Moat: Nvidia is not just a hardware seller; CUDA software locks developers into its ecosystem, preventing customers from migrating to AMD chips.',
        'Blackwell Supply Sold Out: Customer bookings for the Blackwell GPU architecture are fully booked for the next 12 months, guaranteeing high short-term revenues.',
        'Sovereign AI Catalyst: Nations (e.g. Japan, France, UAE) are building domestic cloud supercomputers, creating a new sovereign customer layer beyond the US hyperscalers.'
      ],
      keyStrengths: [
        'CUDA software dominance creating high barriers to entry.',
        'Blackwell and Rubin architectures maintaining 18-24 month lead over rivals.',
        'Exceptional cash generation model with zero inventory overhead.'
      ],
      keyRisks: [
        'Geopolitical risk of Taiwan Strait and TSMC dependency.',
        'Cyclical capital expenditure slowdown from major tech cloud providers.',
        'Export limits on high-margin computing hardware.'
      ],
      futureOutlook: 'Nvidia remains the chief arms dealer of the artificial intelligence boom. Blackwell is set to expand revenues through 2026, and the CUDA software ecosystem continues to solidify NVIDIA\'s market position. While TSMC supply chain concentration represents a major single-point-of-failure risk, the immediate demand runway and massive pricing power support a Strong Buy recommendation.'
    }
  }
};

// Seeded LCG dynamic mockup builder to support unlimited company tickers in Sandbox Demo Mode
function generateDynamicMockData(ticker: string): CompanyMockData {
  let seed = 0;
  for (let i = 0; i < ticker.length; i++) {
    seed += ticker.charCodeAt(i) * (i + 1);
  }

  // Stable seeded pseudo-random number generator
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const commonNames: Record<string, string> = {
    AMZN: 'Amazon.com Inc.',
    META: 'Meta Platforms Inc.',
    NFLX: 'Netflix Inc.',
    AMD: 'Advanced Micro Devices Inc.',
    INTC: 'Intel Corporation',
    MS: 'Morgan Stanley',
    JPM: 'JPMorgan Chase & Co.',
    DIS: 'The Walt Disney Company',
    NKE: 'Nike Inc.',
    COF: 'Capital One Financial Corp.',
    JNJ: 'Johnson & Johnson',
    V: 'Visa Inc.',
    PG: 'Procter & Gamble Co.',
    HD: 'Home Depot Inc.',
    UNH: 'UnitedHealth Group Inc.',
    BAC: 'Bank of America Corp.',
    XOM: 'Exxon Mobil Corp.'
  };

  const name = commonNames[ticker] || `${ticker} Corporation`;
  const scale = 0.5 + random() * 2.0;
  const marketCap = Math.round((200e9 + random() * 800e9) * scale);
  const revenue = Math.round((20e9 + random() * 100e9) * scale);
  const marginPercent = Math.round(10 + random() * 30);
  const netIncome = Math.round(revenue * (marginPercent / 100) * 0.8);
  const debt = Math.round(revenue * (0.2 + random() * 0.6));
  const cashFlow = Math.round(netIncome * (0.9 + random() * 0.4));
  const eps = Number((2 + random() * 10).toFixed(2));
  const peRatio = Number((15 + random() * 25).toFixed(1));
  const revenueGrowth = Number((3 + random() * 25).toFixed(2));

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const ceoNames = ['Sarah Jenkins', 'David Chen', 'Elena Rostova', 'Marcus Vance', 'Kenji Sato', 'Amara Diallo'];
  const ceo = ceoNames[Math.floor(random() * ceoNames.length)];
  const founded = (1970 + Math.floor(random() * 45)).toString();

  const mockIntel: CompanyIntel = {
    name,
    ticker,
    headquarters: `${100 + Math.floor(random() * 800)} Innovation Way, Tech City, USA`,
    founders: ['Co-founder Alpha', 'Co-founder Beta'],
    founded,
    ceo,
    industry: 'Technology & Enterprise Solutions',
    employeeCount: Math.round((20000 + random() * 150000) * scale),
    products: ['Product Suite A', 'Platform Solution B', 'Cloud Service C'],
    businessModel: `${name} operates a diversified subscription, software licensing, and cloud service model. The company leverages proprietary technology networks to capture enterprise market share.`,
    website: `https://www.${ticker.toLowerCase()}.com`,
    summary: `${name} is a leading global player in the enterprise software, data solutions, and systems intelligence sector. Under the leadership of CEO ${ceo}, the company is accelerating investment in generative AI, corporate database platforms, and custom network solutions to support high-growth commercial channels.`
  };

  const mockFinancials: FinancialData = {
    metrics: {
      revenue,
      netIncome,
      operatingMargin: marginPercent,
      debt,
      cashFlow,
      marketCap,
      eps,
      peRatio,
      revenueGrowth
    },
    formattedMetrics: {
      revenue: { label: 'Revenue (TTM)', value: formatNumber(revenue), type: 'currency', trend: 'up' },
      netIncome: { label: 'Net Income (TTM)', value: formatNumber(netIncome), type: 'currency', trend: 'up' },
      operatingMargin: { label: 'Operating Margin', value: `${marginPercent.toFixed(2)}%`, type: 'percent', trend: 'up' },
      debt: { label: 'Total Debt', value: formatNumber(debt), type: 'currency', trend: 'down' },
      cashFlow: { label: 'Free Cash Flow (FCF)', value: formatNumber(cashFlow), type: 'currency', trend: 'up' },
      marketCap: { label: 'Market Cap', value: formatNumber(marketCap), type: 'currency', trend: 'up' },
      eps: { label: 'EPS (Diluted)', value: eps.toFixed(2), type: 'number', trend: 'up' },
      peRatio: { label: 'P/E Ratio', value: peRatio.toString(), type: 'ratio', trend: 'neutral' },
      revenueGrowth: { label: 'Revenue Growth (YoY)', value: `${revenueGrowth.toFixed(2)}%`, type: 'percent', trend: 'up' }
    },
    historical: [
      { year: '2023', revenue: Math.round(revenue * 0.82), netIncome: Math.round(netIncome * 0.78), operatingMargin: marginPercent * 0.9 },
      { year: '2024', revenue: Math.round(revenue * 0.91), netIncome: Math.round(netIncome * 0.88), operatingMargin: marginPercent * 0.95 },
      { year: '2025', revenue, netIncome, operatingMargin: marginPercent }
    ]
  };

  const posSentiment = Math.round(50 + random() * 40);
  const negSentiment = Math.round(random() * (100 - posSentiment));
  const neuSentiment = 100 - posSentiment - negSentiment;

  const mockNews: NewsData = {
    articles: [
      {
        id: `news_${ticker}_1`,
        title: `${name} Reports Breakthrough in Enterprise AI Integrations`,
        sentiment: 'positive',
        category: 'AI announcements',
        source: 'Business Wire',
        summary: `The tech giant revealed a major update to its product suite, introducing native agentic AI integrations that promise to cut operations costs for enterprise clients.`,
        date: '2026-05-12',
        url: 'https://www.businesswire.com'
      },
      {
        id: `news_${ticker}_2`,
        title: `Analysts Praise ${name} Q1 Earnings Beat and Raised Outlook`,
        sentiment: 'positive',
        category: 'earnings',
        source: 'Bloomberg',
        summary: `Revenue and EPS for the recent quarter beat consensus expectations, driven by strong growth in core enterprise software divisions and cloud capacity.`,
        date: '2026-06-02',
        url: 'https://www.bloomberg.com'
      }
    ],
    sentimentSummary: {
      positive: posSentiment,
      neutral: neuSentiment,
      negative: negSentiment
    }
  };

  const mockCompetitors: CompetitorData = {
    competitors: [
      {
        name: 'Generic Competitor Ltd',
        ticker: 'COMP',
        revenue: Math.round(revenue * 0.7),
        marketCap: Math.round(marketCap * 0.6),
        profitability: Math.round(marginPercent * 0.9),
        valuation: peRatio * 1.1,
        innovation: 75,
        strengths: ['Strong regional footprint', 'Lower operational overhead'],
        weaknesses: ['Limited software ecosystem lock-in']
      }
    ],
    comparisonNotes: `${name} maintains superior market margins compared to its secondary peers, leveraging proprietary technology software suites to command premium contract rates.`
  };

  const mockRisks: RiskData = {
    risks: [
      {
        category: 'Regulatory',
        severity: 'Medium',
        explanation: 'Evolving data privacy regulations globally may restrict software feature integrations or increase compliance overhead expenses.',
        mitigation: 'Investing in localized sovereignty cloud infrastructure and advanced encryption compliance.'
      },
      {
        category: 'Technology',
        severity: 'Medium',
        explanation: 'Rapid shifts in developer ecosystems demanding constant research capital to avoid obsolescence.',
        mitigation: 'Nurturing deep developer network programs and releasing open-source SDK components.'
      }
    ],
    overallScore: Math.round(20 + random() * 45)
  };

  const recommendation = peRatio > 35 ? 'Hold' : 'Buy';
  const mockDecision: Decision = {
    recommendation,
    confidence: Math.round(75 + random() * 20),
    reasoning: [
      `Leading Market Position: ${name} holds robust scale in core enterprise technologies.`,
      `Stable Margins Profile: Operating margin of ${marginPercent}% provides strong cash reserves.`,
      `Geographical Diversification: Serves clients globally across multiple tech segments.`
    ],
    keyStrengths: [
      'High client contract renewal rates.',
      'Strong free cash flow conversions.',
      'Rapid deployment pipelines.'
    ],
    keyRisks: [
      'Increased client acquisition cost.',
      'Antitrust scrutiny in regional markets.'
    ],
    futureOutlook: `${name} is well-positioned to maintain steady growth rates over the coming years. Its focus on enterprise integration and generative AI tools offers clear margin tailwinds, making it a reliable holding with solid cash generation.`
  };

  return {
    intel: mockIntel,
    financials: mockFinancials,
    news: mockNews,
    competitors: mockCompetitors,
    risks: mockRisks,
    decision: mockDecision
  };
}

export const MOCK_DATABASE: Record<string, CompanyMockData> = new Proxy(BASE_MOCK_DATABASE, {
  get(target, prop: string) {
    const cleanTicker = prop.toUpperCase().trim();
    if (target[cleanTicker]) {
      return target[cleanTicker];
    }
    return generateDynamicMockData(cleanTicker);
  },
  has(target, prop: string) {
    return true;
  }
});
