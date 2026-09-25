/**
 * HánNgữ Pro - Bẫy Hán-Việt & Phân Tích Ngữ Cảnh Chuyên Sâu
 * Giải mã các từ vựng người Việt dễ dịch sai do đồng âm / đồng tự nhưng dị nghĩa
 */

export const HAN_VIET_TRAPS = [
  {
    id: 'trap_1',
    hanzi: '方便',
    pinyin: 'fāngbiàn',
    hanviet: 'Phương tiện',
    commonMistake: 'Nghĩ là "phương tiện giao thông" (xe máy, xe buýt, máy bay...)',
    trueMeaning: 'Thuận tiện, tiện lợi, rảnh rỗi; hoặc nói giảm nói tránh của "đi vệ sinh".',
    deepExplanation: 'Trong tiếng Việt, "phương tiện" là công cụ hoặc xe cộ (transportation). Nhưng trong tiếng Trung, phương tiện giao thông phải là 交通工具 (jiāotōng gōngjù). 方便 chỉ dùng để nói về sự thuận tiện, tiện lợi về mặt thời gian hoặc điều kiện.',
    exampleZh: '你现在说话方便吗？',
    examplePinyin: 'Nǐ xiànzài shuōhuà fāngbiàn ma?',
    exampleVi: 'Bây giờ bạn có tiện nói chuyện không?',
    slangExampleZh: '我想去方便一下。',
    slangExampleVi: 'Tôi muốn đi vệ sinh một chút (nói lịch sự kín đáo).',
    quiz: {
      question: 'Muốn hỏi: "Bây giờ bạn có tiện nói chuyện điện thoại không?", câu nào chuẩn xác?',
      options: [
        'A. 你现在说话方便吗？',
        'B. 你现在说话有交通工具吗？',
        'C. 你现在说话便宜吗？',
        'D. 你现在说话解决吗？'
      ],
      correctAnswer: 0,
      explanation: 'Dùng "方便" với nghĩa "tiện lợi, rảnh tay để nói chuyện".'
    }
  },
  {
    id: 'trap_2',
    hanzi: '东西',
    pinyin: 'dōngxi',
    hanviet: 'Đông tây',
    commonMistake: 'Nghĩ là "hướng Đông và hướng Tây" trong địa lý.',
    trueMeaning: 'Đồ đạc, vật phẩm, thứ, cái gì đó; (khi đọc dōngxī thì mới là hướng đông tây).',
    deepExplanation: 'Khi đọc thanh nhẹ "dōngxi", từ này mang nghĩa là đồ đạc, hàng hóa, sự vật. Tương truyền ngày xưa người Trung Quốc đi chợ phiên chỉ mua hàng ở hai chợ Đông và chợ Tây ở Trường An, nên gọi là "mua đông tây" (买东西).',
    exampleZh: '你今天在超市买了什么东西？',
    examplePinyin: 'Nǐ jīntiān zài chāoshì mǎi le shénme dōngxi?',
    exampleVi: 'Hôm nay bạn đã mua những món đồ gì ở siêu thị?',
    quiz: {
      question: 'Câu "这台机器是什么东西？" nghĩa là gì?',
      options: [
        'A. Cỗ máy này hướng về phía đông hay phía tây?',
        'B. Cỗ máy này là thứ gì/cái gì vậy?',
        'C. Cỗ máy này đi từ đông sang tây?',
        'D. Cỗ máy này có giá bao nhiêu?'
      ],
      correctAnswer: 1,
      explanation: '东西 ở đây là danh từ mang nghĩa "thứ gì / đồ gì".'
    }
  },
  {
    id: 'trap_3',
    hanzi: '勉强',
    pinyin: 'miǎnqiǎng',
    hanviet: 'Miễn cưỡng',
    commonMistake: 'Chỉ hiểu là "bị ép buộc, không tự nguyện làm điều gì đó".',
    trueMeaning: 'Ngoài nghĩa ép buộc, còn có nghĩa cực kỳ phổ biến: "Ráng, chật vật, vừa khít, tạm bợ mới đạt được".',
    deepExplanation: 'Người Việt chỉ dùng "miễn cưỡng" khi ai đó không muốn làm nhưng bị ép. Nhưng trong tiếng Trung, nếu bạn thi được 60/100 điểm, người ta nói: "他勉强及格了" (Anh ấy chật vật/vừa khít điểm đỗ qua môn). Hoặc căn phòng chỉ "勉强住下两个人" (ráng lắm mới chen chúc được 2 người).',
    exampleZh: '这次HSK考试，他准备得不充分，只是勉强及格。',
    examplePinyin: 'Zhè cì HSK kǎoshì, tā zhǔnbèi de bù chōngfèn, zhǐshì miǎnqiǎng jígé.',
    exampleVi: 'Kỳ thi HSK lần này anh ấy chuẩn bị chưa kỹ, chỉ chật vật vừa đủ điểm đỗ.',
    quiz: {
      question: 'Khi nói "这间屋子勉强能住四个人", người nói ngụ ý điều gì?',
      options: [
        'A. Bốn người bị ép buộc phải ở trong căn phòng này.',
        'B. Căn phòng này rất rộng rãi thoải mái cho bốn người.',
        'C. Căn phòng này khá chật, ráng lắm mới đủ chỗ nhét bốn người.',
        'D. Bốn người này không thích ở cùng nhau.'
      ],
      correctAnswer: 2,
      explanation: '勉强 ở đây biểu thị mức độ vừa khít, chật vật, ráng lắm mới được.'
    }
  },
  {
    id: 'trap_4',
    hanzi: '老婆',
    pinyin: 'lǎopo',
    hanviet: 'Lão bà',
    commonMistake: 'Nghĩ là "bà cụ già" hoặc "mẹ già" theo cách hiểu phim cổ trang.',
    trueMeaning: 'Vợ, bà xã (cách gọi thân mật, khẩu ngữ phổ biến nhất giữa vợ chồng).',
    deepExplanation: 'Chữ 老 (lão) trong tiếng Trung khẩu ngữ thường dùng biểu thị sự thân mật, quen thuộc (như 老师, 老朋友, 老公, 老婆), chứ không nhất thiết là già nua tuổi tác. Để gọi bà cụ già cao tuổi, người Trung Quốc dùng 老奶奶 (lǎonǎinai) hoặc 老太太 (lǎotàitai).',
    exampleZh: '下班后我要回家陪老婆做饭。',
    examplePinyin: 'Xiàbān hòu wǒ yào huíjiā péi lǎopo zuòfàn.',
    exampleVi: 'Sau khi tan làm tôi phải về nhà cùng bà xã nấu cơm.',
    quiz: {
      question: 'Một thanh niên 25 tuổi giới thiệu: "这是我老婆", bạn nên hiểu là:',
      options: [
        'A. Đây là bà nội tôi.',
        'B. Đây là bà cụ hàng xóm tôi.',
        'C. Đây là vợ / bà xã của tôi.',
        'D. Đây là mẹ tôi.'
      ],
      correctAnswer: 2,
      explanation: '老婆 là danh từ khẩu ngữ chỉ "vợ / bà xã".'
    }
  },
  {
    id: 'trap_5',
    hanzi: '答应',
    pinyin: 'dāying',
    hanviet: 'Đáp ứng',
    commonMistake: 'Hiểu là "đáp ứng nhu cầu, thỏa mãn tiêu chuẩn vật chất".',
    trueMeaning: 'Đồng ý, nhận lời hứa; hoặc lên tiếng trả lời khi được gọi tên.',
    deepExplanation: 'Tiếng Việt nói "đáp ứng nhu cầu" thì tiếng Trung phải dùng 满足需求 (mǎnzú xūqiú). Còn 答应 trong tiếng Trung là: ai đó nhờ việc gì và bạn nhận lời (我答应你); hoặc ai đó gọi tên mà bạn "dạ/vâng" lên tiếng (叫他半天，他也不答应).',
    exampleZh: '我已经答应借给他那本书了。',
    examplePinyin: 'Wǒ yǐjīng dāying jiè gěi tā nà běn shū le.',
    exampleVi: 'Tôi đã nhận lời/đồng ý cho anh ấy mượn quyển sách đó rồi.',
    quiz: {
      question: 'Dịch câu: "Tôi gọi anh ta mấy lần mà anh ta không hề lên tiếng trả lời":',
      options: [
        'A. 我叫了他好几次，他都没答应。',
        'B. 我叫了他好几次，他都没满足。',
        'C. 我叫了他好几次，他都没方便。',
        'D. 我叫了他好几次，他都没解决。'
      ],
      correctAnswer: 0,
      explanation: '答应 mang nghĩa lên tiếng đáp lại khi được ai đó gọi.'
    }
  },
  {
    id: 'trap_6',
    hanzi: '厉害',
    pinyin: 'lìhai',
    hanviet: 'Lợi hại',
    commonMistake: 'Chỉ hiểu là "có lợi và có hại" (lợi hại đôi đường).',
    trueMeaning: 'Ghê gớm, cừ khôi, xuất sắc; hoặc dữ dội, đau đớn dữ dội, nghiêm trọng.',
    deepExplanation: 'Khi khen người khác: "你太厉害了!" nghĩa là "Bạn đỉnh quá, cừ quá!". Nhưng khi nói về bệnh tật hoặc thời tiết: "胃疼得厉害" nghĩa là "Đau dạ dày dữ dội quằn quại"; "病得很厉害" nghĩa là "Bệnh rất nặng".',
    exampleZh: '他中文说得像母语者一样，真厉害！',
    examplePinyin: 'Tā Zhōngwén shuō de xiàng mǔyǔzhě yīyàng, zhēn lìhai!',
    exampleVi: 'Anh ấy nói tiếng Trung như người bản xứ vậy, đỉnh thật đấy!',
    quiz: {
      question: 'Khi bác sĩ bảo: "他的咳嗽很厉害", nghĩa là gì?',
      options: [
        'A. Cơn ho của anh ấy có mặt lợi và mặt hại.',
        'B. Cơn ho của anh ấy rất nặng và dữ dội.',
        'C. Anh ấy ho rất thông minh và giỏi giang.',
        'D. Anh ấy không bị ho.'
      ],
      correctAnswer: 1,
      explanation: '厉害 đi với triệu chứng bệnh tật biểu thị mức độ nghiêm trọng, dữ dội.'
    }
  },
  {
    id: 'trap_7',
    hanzi: '检讨',
    pinyin: 'jiǎntǎo',
    hanviet: 'Kiểm thảo',
    commonMistake: 'Hiểu là "kiểm tra và thảo luận, trao đổi công việc bình thường".',
    trueMeaning: 'Bản tự kiểm điểm, nhận lỗi sâu sắc sau khi làm sai điều gì.',
    deepExplanation: 'Trong tiếng Việt, một số cơ quan dùng "kiểm thảo" theo nghĩa rà soát thảo luận. Nhưng trong tiếng Trung, 检讨 mang sắc thái rất nặng: Tự nhận khuyết điểm, viết bản kiểm điểm (写检讨书) xin lỗi lãnh đạo hoặc tập thể.',
    exampleZh: '因为上班经常迟到，他被经理要求写一份深刻的检讨。',
    examplePinyin: 'Yīnwèi shàngbān jīngcháng chídào, tā bèi jīnglǐ yāoqiú xiě yī fèn shēnkè de jiǎntǎo.',
    exampleVi: 'Vì đi làm thường xuyên muộn, anh ấy bị giám đốc yêu cầu viết một bản tự kiểm điểm sâu sắc.',
    quiz: {
      question: 'Hành động "写检讨" trong trường học Trung Quốc tương đương với:',
      options: [
        'A. Viết bài luận văn học.',
        'B. Viết bản tự kiểm điểm nhận lỗi gửi thầy cô.',
        'C. Viết đề cương ôn thi.',
        'D. Viết nhật ký hàng ngày.'
      ],
      correctAnswer: 1,
      explanation: '检讨 là tự kiểm điểm, nhận sai lầm.'
    }
  },
  {
    id: 'trap_8',
    hanzi: '耽误',
    pinyin: 'dānwu',
    hanviet: 'Đam ngộ',
    commonMistake: 'Nghĩ là say mê, đam mê dẫn đến giác ngộ.',
    trueMeaning: 'Làm trễ nải, lỡ dở thời gian, làm chậm trễ công việc quan trọng.',
    deepExplanation: 'Chữ 耽 có nghĩa là trì hoãn, chần chừ; 误 là sai sót, lỡ dở. Ghép lại là vì việc này mà làm lỡ việc kia: 耽误工作 (lỡ dở công việc), 耽误时间 (lãng phí lỡ mất thời gian quý báu).',
    exampleZh: '堵车耽误了我赶飞机的时间。',
    examplePinyin: 'Dǔchē dānwu le wǒ gǎn fēijī de shíjiān.',
    exampleVi: 'Tắc đường đã làm lỡ mất thời gian bắt chuyến bay của tôi.',
    quiz: {
      question: 'Khi muốn xin lỗi: "Ngại quá, đã làm mất thời gian quý báu của bạn rồi", dùng câu nào?',
      options: [
        'A. 不好意思，耽误您的宝贵时间了。',
        'B. 不好意思，方便您的宝贵时间了。',
        'C. 不好意思，勉强您的宝贵时间了。',
        'D. 不好意思，检讨您的宝贵时间了。'
      ],
      correctAnswer: 0,
      explanation: '耽误时间 là cụm từ chuẩn mực chỉ việc làm trễ nải, làm mất thì giờ của người khác.'
    }
  }
];
