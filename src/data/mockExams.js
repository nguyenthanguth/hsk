/**
 * HánNgữ Pro - Simulated HSK Exam Papers (Đề thi thử HSK 1 đến HSK 9)
 * Mô phỏng sát cấu trúc đề thi chính thức chuẩn HSK 3.0 với giải thích chi tiết
 */

export const MOCK_EXAMS = [
  {
    id: 'exam_hsk1',
    level: 1,
    title: 'Đề Thi Thử Chuẩn Hóa HSK 1 - Mã đề A101',
    durationMinutes: 25,
    totalQuestions: 6,
    maxScore: 200,
    passScore: 120,
    sections: [
      {
        part: 'listening',
        partName: 'Phần 1: Nghe Hiểu (听力)',
        instructions: 'Nghe audio tiếng Trung và chọn đáp án chính xác nhất.',
        questions: [
          {
            id: 'hsk1_q1',
            type: 'listen_choose',
            audioScript: '你好，王老师在学校吗？在，他在三号教室。',
            questionText: '王老师现在在哪儿？(Thầy giáo Vương hiện đang ở đâu?)',
            options: [
              'A. 在家里 (Ở nhà)',
              'B. 在三号教室 (Ở phòng học số 3)',
              'C. 在医院 (Ở bệnh viện)',
              'D. 在商店 (Ở cửa hàng)'
            ],
            correctAnswer: 1,
            explanation: 'Trong đoạn hội thoại, người nói khẳng định: "在，他在三号教室" (Có, thầy đang ở phòng học số 3).'
          },
          {
            id: 'hsk1_q2',
            type: 'listen_choose',
            audioScript: '你想喝茶还是喝水？我想喝一杯热茶，谢谢。',
            questionText: '他想喝什么？(Anh ấy muốn uống gì?)',
            options: [
              'A. 凉水 (Nước lạnh)',
              'B. 咖啡 (Cà phê)',
              'C. 热茶 (Trà nóng)',
              'D. 牛奶 (Sữa bò)'
            ],
            correctAnswer: 2,
            explanation: 'Người nói trả lời rõ ràng: "我想喝一杯热茶" (Tôi muốn uống một ly trà nóng).'
          }
        ]
      },
      {
        part: 'reading',
        partName: 'Phần 2: Đọc Hiểu (阅读)',
        instructions: 'Đọc kỹ câu và chọn từ hoặc nhận định đúng.',
        questions: [
          {
            id: 'hsk1_q3',
            type: 'cloze',
            questionText: '请问，这个红色的苹果一斤_____钱？',
            options: [
              'A. 多少 (duōshao)',
              'B. 几 (jǐ)',
              'C. 怎么 (zěnme)',
              'D. 哪儿 (nǎr)'
            ],
            correctAnswer: 0,
            explanation: 'Cụm từ cố định để hỏi giá tiền là "多少钱" (bao nhiêu tiền).'
          },
          {
            id: 'hsk1_q4',
            type: 'reading_comprehension',
            passage: '我叫大卫，我是美国人。我喜欢中国菜，也会说一点儿汉语。',
            questionText: '关于大卫，哪项是正确的？(Về David, điều nào sau đây là đúng?)',
            options: [
              'A. 他是中国人 (Anh ấy là người Trung Quốc)',
              'B. 他不会说汉语 (Anh ấy không biết nói tiếng Hán)',
              'C. 他会说一点儿汉语 (Anh ấy biết nói một chút tiếng Hán)',
              'D. 他不喜欢中国菜 (Anh ấy không thích món ăn Trung Quốc)'
            ],
            correctAnswer: 2,
            explanation: 'Trong bài có câu: "也会说一点儿汉语" (cũng biết nói một chút tiếng Hán).'
          }
        ]
      },
      {
        part: 'writing',
        partName: 'Phần 3: Trật Tự Câu & Ngữ Pháp (语法)',
        instructions: 'Sắp xếp các từ đã cho thành một câu hoàn chỉnh đúng ngữ pháp.',
        questions: [
          {
            id: 'hsk1_q5',
            type: 'reorder',
            questionText: 'Sắp xếp các cụm từ sau thành câu đúng: [很] [学中文] [喜欢] [我]',
            options: [
              'A. 我喜欢很学中文。',
              'B. 我很喜欢学中文。',
              'C. 学中文我很喜欢。',
              'D. 喜欢学中文我很。'
            ],
            correctAnswer: 1,
            explanation: 'Phó từ chỉ mức độ "很" phải đứng trước động từ tâm lý "喜欢": 主语 (我) + 很 + 动词 (喜欢) + 宾语 (学中文).'
          },
          {
            id: 'hsk1_q6',
            type: 'reorder',
            questionText: 'Sắp xếp các cụm từ sau: [是] [朋友] [我的] [他]',
            options: [
              'A. 他是我的朋友。',
              'B. 他我的朋友是。',
              'C. 是他我的朋友。',
              'D. 我的朋友他是。'
            ],
            correctAnswer: 0,
            explanation: 'Cấu trúc câu chữ "是": Chủ ngữ (他) + 是 + Định ngữ + 的 + Trung tâm ngữ (我的朋友).'
          }
        ]
      }
    ]
  },
  {
    id: 'exam_hsk3',
    level: 3,
    title: 'Đề Thi Thử HSK 3 - Độc Lập Giao Tiếp - Mã đề C301',
    durationMinutes: 45,
    totalQuestions: 6,
    maxScore: 300,
    passScore: 180,
    sections: [
      {
        part: 'listening',
        partName: 'Phần 1: Nghe Hiểu (听力)',
        instructions: 'Nghe đối thoại và chọn đáp án chính xác.',
        questions: [
          {
            id: 'hsk3_q1',
            type: 'listen_choose',
            audioScript: '男：小李，你的感冒好些了吗？还要去医院吗？女：昨天吃了医生开的药，现在已经好多了，不用再去医院了。',
            questionText: '根据对话，女的现在怎么样？(Theo đối thoại, người nữ hiện thế nào?)',
            options: [
              'A. 还要去医院 (Vẫn phải đến bệnh viện)',
              'B. 身体已经好多了 (Sức khỏe đã đỡ nhiều rồi)',
              'C. 药吃完了 (Thuốc đã uống hết rồi)',
              'D. 医生让她住院 (Bác sĩ bảo cô ấy nhập viện)'
            ],
            correctAnswer: 1,
            explanation: 'Người nữ nói rõ: "现在已经好多了，不用再去医院了" (Hiện nay đã đỡ nhiều rồi, không cần đi viện nữa).'
          }
        ]
      },
      {
        part: 'reading',
        partName: 'Phần 2: Đọc Hiểu & Điền Từ (阅读)',
        instructions: 'Chọn đáp án đúng nhất để hoàn chỉnh văn bản.',
        questions: [
          {
            id: 'hsk3_q2',
            type: 'cloze',
            questionText: '只要大家互相_____，就没有解决不了的困难。',
            options: [
              'A. 迟到 (chídào - đến muộn)',
              'B. 帮助 (bāngzhù - giúp đỡ)',
              'C. 奇怪 (qíguài - kỳ lạ)',
              'D. 刮风 (guāfēng - nổi gió)'
            ],
            correctAnswer: 1,
            explanation: 'Cụm từ logic: 互相帮助 (giúp đỡ lẫn nhau).'
          },
          {
            id: 'hsk3_q3',
            type: 'reading_comprehension',
            passage: '很多人以为多喝水对身体好，其实如果在运动后立刻喝大量的水，反而会增加心脏的负担。科学的做法是先休息几分钟，然后再慢慢喝少量的温水。',
            questionText: '运动后应该怎么喝水？(Sau khi vận động nên uống nước như thế nào?)',
            options: [
              'A. 马上喝大量的冷水 (Ngay lập tức uống lượng lớn nước lạnh)',
              'B. 不应该喝水 (Không nên uống nước)',
              'C. 先休息片刻，再慢饮少量温水 (Nghỉ ngơi chốc lát, rồi uống chậm lượng nhỏ nước ấm)',
              'D. 喝甜饮料最好 (Uống nước ngọt là tốt nhất)'
            ],
            correctAnswer: 2,
            explanation: 'Đoạn văn nêu: "科学的做法是先休息几分钟，然后再慢慢喝少量的温水".'
          }
        ]
      },
      {
        part: 'writing',
        partName: 'Phần 3: Viết & Cấu Trúc Câu Chữ 把 (书写)',
        instructions: 'Sắp xếp các từ cho sẵn thành câu chữ 把 chuẩn chỉnh.',
        questions: [
          {
            id: 'hsk3_q4',
            type: 'reorder',
            questionText: 'Sắp xếp câu chữ 把: [请你] [桌子上的] [把] [收拾干净] [书本]',
            options: [
              'A. 请你把桌子上的书本收拾干净。',
              'B. 请你桌子上的书本把收拾干净。',
              'C. 桌子上的书本请你收拾把干净。',
              'D. 把桌子上的书本请你收拾干净。'
            ],
            correctAnswer: 0,
            explanation: 'Cấu trúc câu chữ 把: Chủ ngữ (请你) + 把 + Tân ngữ (桌子上的书本) + Động từ (收拾) + Bổ ngữ kết quả (干净).'
          }
        ]
      }
    ]
  },
  {
    id: 'exam_hsk5',
    level: 5,
    title: 'Đề Thi Thử HSK 5 - Phân Tích Chuyên Nghiệp - Mã đề E501',
    durationMinutes: 60,
    totalQuestions: 5,
    maxScore: 300,
    passScore: 180,
    sections: [
      {
        part: 'reading',
        partName: 'Phần 1: Đọc Hiểu & Nghị Luận (阅读)',
        instructions: 'Đọc văn bản xã luận và suy luận luận điểm cốt lõi.',
        questions: [
          {
            id: 'hsk5_q1',
            type: 'reading_comprehension',
            passage: '在信息爆炸的时代，人们获取知识的门槛大大降低，然而深度思考的能力却面临萎缩的危机。碎片化的阅读习惯虽然能让人在短时间内浏览大量资讯，却极易使思维流于表面。唯有沉潜下心，建立系统的认知框架，方能将外部信息真正内化为个人智慧。',
            questionText: '作者在这段文字中主要强调了什么？(Tác giả chủ yếu nhấn mạnh điều gì?)',
            options: [
              'A. 应当完全拒绝网络碎片化资讯 (Nên từ chối hoàn toàn tin tức ngắn trên mạng)',
              'B. 深度思考与系统建构认知框架的重要性 (Tầm quan trọng của tư duy sâu và xây dựng khung nhận thức hệ thống)',
              'C. 现代人的阅读速度显著提高 (Tốc độ đọc của người hiện đại tăng rõ rệt)',
              'D. 获取信息的门槛越来越高 (Ngưỡng tiếp cận thông tin ngày càng cao)'
            ],
            correctAnswer: 1,
            explanation: 'Câu kết luận nêu rõ trọng tâm: "唯有沉潜下心，建立系统的认知框架，方能将外部信息真正内化为个人智慧".'
          },
          {
            id: 'hsk5_q2',
            type: 'cloze',
            questionText: '企业在面对市场激烈竞争时，不能盲目跟风，而应当_____自身的独特优势，寻求差异化发展。',
            options: [
              'A. 耽误 (dānwu - lỡ việc)',
              'B. 依赖 (yīlài - ỷ lại)',
              'C. 立足 (lìzú - đứng vững, dựa trên nền tảng)',
              'D. 勉强 (miǎnqiǎng - gượng gạo)'
            ],
            correctAnswer: 2,
            explanation: '"立足于...优势" là cụm từ cao cấp chỉ việc đứng vững và phát huy thế mạnh của bản thân.'
          }
        ]
      },
      {
        part: 'writing',
        partName: 'Phần 2: Viết Luận & Sử Dụng Từ Trọng Điểm (书写)',
        instructions: 'Chọn phương án kết hợp ngữ pháp chính xác nhất cho câu phức.',
        questions: [
          {
            id: 'hsk5_q3',
            type: 'reorder',
            questionText: 'Cấu trúc câu biểu thị nhượng bộ: [这项任务] [非常艰巨] [团队] [尽管] [顺利完成] [还是] [，] [了]',
            options: [
              'A. 尽管这项任务非常艰巨，团队还是顺利完成了。',
              'B. 这项任务团队尽管非常艰巨，顺利完成了还是。',
              'C. 还是团队顺利完成了，尽管这项任务非常艰巨。',
              'D. 尽管团队非常艰巨，这项任务还是顺利完成了。'
            ],
            correctAnswer: 0,
            explanation: 'Cặp liên từ: "尽管...，还是..." (Mặc dù..., nhưng vẫn...).'
          }
        ]
      }
    ]
  },
  {
    id: 'exam_hsk7_9',
    level: 7,
    title: 'Đề Mô Phỏng Cao Cấp HSK 7-9 - Học Thuật & Dịch Thuật Chuyên Ngành',
    durationMinutes: 75,
    totalQuestions: 4,
    maxScore: 300,
    passScore: 180,
    sections: [
      {
        part: 'reading',
        partName: 'Phần 1: Đọc Hiểu Học Thuật & Quan Hệ Quốc Tế (学术阅读)',
        instructions: 'Phân tích văn bản chính sách kinh tế - ngoại giao HSK 3.0.',
        questions: [
          {
            id: 'hsk7_q1',
            type: 'reading_comprehension',
            passage: '当前，全球产业链重构呈现出去中心化与区域化并存的复杂态势。部分发达经济体推行所谓“去风险”策略，实质上违背了比较优势这一基本的经济学规律。各国唯有秉持开放包容之姿态，在绿色转型与数字技术等新兴赛道加强跨国协作，方能重塑具有韧性的全球供应链生态。',
            questionText: '根据上述文段，重塑全球供应链韧性的关键路径是什么？(Theo đoạn văn, con đường then chốt để tái định hình tính dẻo dai của chuỗi cung ứng toàn cầu là gì?)',
            options: [
              'A. 加速推行各国的产业闭环与孤立主义 (Đẩy nhanh việc khép kín chuỗi ngành và chủ nghĩa biệt lập)',
              'B. 彻底放弃传统制造业，全部转入虚拟经济 (Từ bỏ triệt để sản xuất truyền thống để sang kinh tế ảo)',
              'C. 秉持开放包容，在绿色转型与数字技术等领域深化跨国协作 (Giữ vững tinh thần cởi mở bao hàm, làm sâu sắc hợp tác xuyên quốc gia trong chuyển đổi xanh và công nghệ số)',
              'D. 单方面依赖少数发达经济体的技术转移 (Phụ thuộc đơn phương vào chuyển giao công nghệ của một số nước phát triển)'
            ],
            correctAnswer: 2,
            explanation: 'Đoạn văn khẳng định rành mạch: "各国唯有秉持开放包容之姿态，在绿色转型与数字技术等新兴赛道加强跨国协作，方能重塑具有韧性的全球供应链生态".'
          }
        ]
      },
      {
        part: 'translation',
        partName: 'Phần 2: Biên Dịch Chuyên Sâu Song Ngữ (翻译)',
        instructions: 'Lựa chọn bản dịch chuẩn xác về văn phong ngoại giao và kinh tế chính trị.',
        questions: [
          {
            id: 'hsk7_q2',
            type: 'translation_eval',
            questionText: 'Dịch câu sau sang văn phong ngoại giao tiếng Trung chuẩn HSK 7-9: "Việc ký kết thỏa thuận này là một mốc son quan trọng, tiếp thêm động lực mạnh mẽ cho quan hệ hợp tác kinh tế - thương mại song phương."',
            options: [
              'A. 签这个协议很重要，给两个国家的买卖很多力量。',
              'B. 该协定的签署具有里程碑意义，为双边经贸合作注入了强劲动力。',
              'C. 签署协议是个好处，让两边的经济变得很厉害。',
              'D. 因为签了协议，所以双方的做生意方便起来了。'
            ],
            correctAnswer: 1,
            explanation: 'Văn phong HSK 7-9 yêu cầu sử dụng từ ngữ chính thức (书面语): "签署具有里程碑意义" (ký kết mang ý nghĩa cột mốc), "为双边经贸合作注入强劲动力" (tiếp thêm động lực mạnh mẽ cho hợp tác kinh tế thương mại song phương).'
          },
          {
            id: 'hsk7_q3',
            type: 'translation_eval',
            questionText: 'Thành ngữ "韬光养晦" trong văn cảnh chiến lược đối ngoại tương ứng với định nghĩa nào?',
            options: [
              'A. Giấu mình chờ thời, kín đáo tích lũy nội lực không phô trương',
              'B. Bỏ mặc sự đời, lui về ở ẩn nơi rừng núi',
              'C. Tự cao tự đại, đe dọa các nước láng giềng',
              'D. Chi tiêu hoang phí ngân sách quốc gia'
            ],
            correctAnswer: 0,
            explanation: '"韬光养晦" là chiến lược ẩn giấu tài năng, giấu mình chờ thời, bền bỉ bồi đắp thực lực.'
          }
        ]
      }
    ]
  }
];
