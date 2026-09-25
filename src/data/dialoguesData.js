/**
 * HánNgữ Pro - Immersive Situational Dialogues (Hội thoại nhập vai thực tế HSK 1 - 9)
 * Tái hiện các bối cảnh đời thực: Nhà hàng, Chợ buôn, Phỏng vấn và Đàm phán cấp cao
 */

export const SITUATIONAL_DIALOGUES = [
  {
    id: 'scene_dining',
    title: 'Gọi Món & Không Ăn Cay Tại Quán Ăn Tứ Xuyên',
    levelBadge: 'HSK 1 - 2 (Sơ Cấp)',
    location: 'Quán ăn Thành Đô (成都小吃店)',
    description: 'Thực khách Việt Nam lần đầu vào quán ăn Tứ Xuyên, cần gọi món ngon, dặn dò tuyệt đối không ăn cay và hỏi thanh toán.',
    turns: [
      {
        speaker: 'Phục vụ quán (服务员)',
        role: 'npc',
        zh: '您好！欢迎光临，请问几位？里面请坐！',
        pinyin: 'Nín hǎo! Huānyíng guānglín, qǐngwèn jǐ wèi? Lǐmiàn qǐng zuò!',
        vi: 'Kính chào quý khách! Xin hỏi quý khách đi mấy người ạ? Mời vào bên trong ngồi!'
      },
      {
        speaker: 'Học viên (Bạn - 我)',
        role: 'user',
        zh: '你好，我们两个人。请给我菜单。',
        pinyin: 'Nǐ hǎo, wǒmen liǎng gè rén. Qǐng gěi wǒ càidān.',
        vi: 'Chào bạn, chúng tôi đi 2 người. Xin hãy cho tôi xem thực đơn.'
      },
      {
        speaker: 'Phục vụ quán (服务员)',
        role: 'npc',
        zh: '这是菜单。我们店的麻婆豆腐和水煮牛肉最有名，您想尝尝吗？',
        pinyin: 'Zhè shì càidān. Wǒmen diàn de mápó dòufu hé shuǐzhǔ niúròu zuì yǒumíng, nín xiǎng chángcháng ma?',
        vi: 'Đây là thực đơn. Đậu phụ Ma Bà và Bò hầm cay là hai món nổi tiếng nhất quán, quý khách muốn nếm thử không?'
      },
      {
        speaker: 'Học viên (Bạn - 我)',
        role: 'user',
        zh: '我要一份麻婆豆腐，但是请不要放辣椒，我不吃辣。还要两碗米饭。',
        pinyin: 'Wǒ yào yī fèn mápó dòufu, dànshì qǐng bù yào fàng làjiāo, wǒ bù chī là. Hái yào liǎng wǎn mǐfàn.',
        vi: 'Tôi muốn 1 phần đậu phụ Ma Bà, nhưng xin đừng cho ớt nhé, tôi không ăn cay. Cho thêm 2 bát cơm trắng nữa.'
      },
      {
        speaker: 'Phục vụ quán (服务员)',
        role: 'npc',
        zh: '好的，微辣也不要对吧？没问题，请稍等！',
        pinyin: 'Hǎo de, wēi là yě bù yào duì ba? Méi wèntí, qǐng shāoděng!',
        vi: 'Dạ được, ngay cả cay nhẹ cũng không cho đúng không ạ? Không vấn đề gì, xin quý khách đợi một lát!'
      }
    ],
    challenge: {
      question: 'Khi bạn ăn xong và muốn nói "Tính tiền, tôi có thể quét mã Alipay hoặc WeChat Pay không?", bạn nói thế nào?',
      options: [
        'A. 服务员，买单！我可以扫微信或者支付宝吗？',
        'B. 服务员，卖单！我想睡觉一碗。',
        'C. 多少钱，我想去方便一下。',
        'D. 谢谢，这里太便宜了。'
      ],
      correctAnswer: 0,
      explanation: '买单 (mǎidān) là tính tiền; 扫微信或者支付宝 (sǎo wēixìn huòzhě zhìfùbǎo) là cách nói chuẩn mực để quét mã thanh toán không tiền mặt ở Trung Quốc.'
    }
  },
  {
    id: 'scene_bargaining',
    title: 'Mặc Cả & Nhập Hàng Chợ Đầu Mối Quảng Châu',
    levelBadge: 'HSK 3 - 4 (Trung Cấp)',
    location: 'Chợ Bạch Mã Quảng Châu (广州白马服装批发市场)',
    description: 'Thương nhân Việt Nam tìm nguồn hàng thời trang, đàm phán số lượng tối thiểu (MOQ) và thương lượng giảm giá sỉ.',
    turns: [
      {
        speaker: 'Chủ xưởng (老板)',
        role: 'npc',
        zh: '帅哥/美女，来看新款吗？全是我们自己工厂直销的，质量绝对过硬！',
        pinyin: 'Shuàigē / Měinǚ, lái kàn xīnkuǎn ma? Quán shì wǒmen zìjǐ gōngchǎng zhíxiāo de, zhìliàng juéduì guòyìng!',
        vi: 'Bạn đẹp ơi, vào xem mẫu mới nhé? Toàn bộ là hàng xuất xưởng trực tiếp của xưởng chúng tôi, chất lượng tuyệt đối yên tâm!'
      },
      {
        speaker: 'Học viên (Bạn - 我)',
        role: 'user',
        zh: '这款外套手感不错。如果我拿五百件，批发价一件能给多少？',
        pinyin: 'Zhè kuǎn wàitào shǒugǎn bùcuò. Rúguǒ wǒ ná wǔbǎi jiàn, pīfājià yī jiàn néng gěi duōshao?',
        vi: 'Mẫu áo khoác này chất vải sờ rất thích. Nếu tôi lấy 500 chiếc thì giá bán sỉ một chiếc bạn để được bao nhiêu?'
      },
      {
        speaker: 'Chủ xưởng (老板)',
        role: 'npc',
        zh: '五百件算大单了，零售卖一百二，批发给你算七十五一件，怎么样？',
        pinyin: 'Wǔbǎi jiàn suàn dà dān le, língshòu mài yībǎi èr, pīfā gěi nǐ suàn qīshíwǔ yī jiàn, zěnmeyàng?',
        vi: '500 chiếc là đơn lớn rồi đấy, giá bán lẻ 120 tệ, bán sỉ cho bạn tính 75 tệ một chiếc, thấy thế nào?'
      },
      {
        speaker: 'Học viên (Bạn - 我)',
        role: 'user',
        zh: '七十五还是有点贵。我们在越南做长期生意的，如果六十五，今天就签定金合同。',
        pinyin: 'Qīshíwǔ háishì yǒudiǎnr guì. Wǒmen zài Yuènán zuò chángqī shēngyì de, rúguǒ liùshíwǔ, jīntiān jiù qiān dìngjīn hétong.',
        vi: '75 tệ vẫn hơi đắt một chút. Chúng tôi làm ăn lâu dài ở Việt Nam, nếu được 65 tệ thì hôm nay ký hợp đồng đặt cọc luôn.'
      }
    ],
    challenge: {
      question: 'Khi muốn hỏi chủ xưởng: "Xưởng bạn có thể giao hàng thẳng đến kho Bằng Tường không?", câu nào chuẩn xác?',
      options: [
        'A. 你们工厂能直接发货到凭祥仓库吗？',
        'B. 你们工厂有交通工具去越南吗？',
        'C. 你们能把工作耽误在仓库吗？',
        'D. 凭祥仓库方便不方便？'
      ],
      correctAnswer: 0,
      explanation: '发货 (fāhuò - giao hàng), 仓库 (cāngkù - nhà kho). Cấu trúc: 发货到...仓库.'
    }
  },
  {
    id: 'scene_negotiation',
    title: 'Đàm Phán Chuyển Giao Công Nghệ & Ký Kết Hợp Tác Song Phương',
    levelBadge: 'HSK 7 - 9 (Cao Cấp Học Thuật)',
    location: 'Hội nghị Bàn tròn Doanh nghiệp Quốc tế (国际经贸战略洽谈会)',
    description: 'Thương thảo điều khoản chuyển giao sở hữu trí tuệ, chia sẻ dữ liệu và giải quyết tranh chấp kinh tế vĩ mô.',
    turns: [
      {
        speaker: 'Trưởng đoàn đàm phán (谈判代表)',
        role: 'npc',
        zh: '毋庸置疑，本次经贸战略合作契合双方的长远发展利益，但在知识产权保护条款上，我们期望建立更为审慎的追溯机制。',
        pinyin: 'Wùyōngzhìyí, běn cì jīngmào zhànlüè hézuò qìhé shuāngfāng de chángyuǎn fāzhǎn lìyì, dàn zài zhīshi chǎnquán bǎohù tiáokuǎn shàng, wǒmen qīwàng jiànlì gèngwéi shěnlǜ de zhuīsù jīzhì.',
        vi: 'Không còn nghi ngờ gì nữa, sự hợp tác chiến lược kinh tế - thương mại lần này hoàn toàn phù hợp với lợi ích phát triển lâu dài của cả hai bên, song về các điều khoản bảo hộ quyền sở hữu trí tuệ, chúng tôi kỳ vọng thiết lập một cơ chế truy xuất thận trọng hơn.'
      },
      {
        speaker: 'Học viên (Bạn - 我)',
        role: 'user',
        zh: '有鉴于此，我们建议在联合研发阶段引入第三方中立审计机构，以此有效平衡技术赋能与合规风控。',
        pinyin: 'Yǒujiànyúcǐ, wǒmen jiànyì zài liánhé yánfā jiēduàn yǐnrù dì-sān fāng zhōnglì shěnjì jīgòu, yǐ cǐ yǒuxiào pínghéng jìshù fùnéng yǔ hégūi fēngkòng.',
        vi: 'Xuất phát từ thực tế đó, chúng tôi đề xuất đưa cơ quan kiểm toán độc lập bên thứ ba vào giai đoạn nghiên cứu phát triển chung, qua đó cân bằng hiệu quả giữa việc tiếp sức công nghệ và kiểm soát rủi ro tuân thủ.'
      }
    ],
    challenge: {
      question: 'Thành ngữ nào thích hợp nhất để mô tả "đôi bên cùng có lợi, thúc đẩy hợp tác cùng thắng"?',
      options: [
        'A. 互利共赢 (Hùlì gòngyíng)',
        'B. 饮鸩止渴 (Yǐnzhènzhǐkě)',
        'C. 潜移默化 (Qiányímòhuà)',
        'D. 络绎不绝 (Luòyìbùjué)'
      ],
      correctAnswer: 0,
      explanation: '互利共赢 (Tương hỗ cùng thắng, đôi bên cùng có lợi) là cụm từ nền tảng trong mọi thông cáo báo chí và đàm phán ngoại giao thương mại quốc tế.'
    }
  }
];
