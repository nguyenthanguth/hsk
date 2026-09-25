/**
 * Script to generate complete 214 Kangxi Radicals dataset (radicalsData.js)
 * Covers all 214 radicals with stroke count, Sino-Vietnamese names, Pinyin, meanings, etymology, and example characters.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RADICALS_RAW = [
  // 1 stroke (6)
  [1, "一", "Nhất", 1, "yī", "Số một, duy nhất, khởi đầu vạn vật", "Nét ngang nguyên thủy tượng trưng cho sự thống nhất, đường ranh giới trời đất.", [["三","sān","Số ba"], ["下","xià","Bên dưới"], ["不","bù","Không"]]],
  [2, "丨", "Cổn", 1, "gǔn", "Nét sổ đứng, thông suốt từ trên xuống dưới", "Đường thẳng đứng nối liền trời và đất, biểu đạt sự thông suốt.", [["中","zhōng","Trung tâm, ở giữa"], ["丰","fēng","Phong phú, tươi tốt"], ["串","chuàn","Xâu, chuỗi"]]],
  [3, "丶", "Điểm", 1, "diǎn", "Dấu chấm, vết tích nhỏ, ngọn lửa nhỏ", "Hình giọt nước hoặc đốm lửa bập bùng.", [["丸","wán","Viên tròn, viên thuốc"], ["丹","dān","Màu đỏ, đan dược"], ["主","zhǔ","Chủ nhân, chủ yếu"]]],
  [4, "丿", "Phiệt", 1, "piě", "Nét phẩy, uốn cong từ phải sang trái", "Hình dáng chuyển động hoặc vật rơi nghiêng.", [["九","jiǔ","Số chín"], ["升","shēng","Thăng tiến, lít"], ["乏","fá","Thiếu thốn, mệt mỏi"]]],
  [5, "乙", "Ất", 1, "yǐ", "Can thứ hai trong Thiên Can, mầm cây uốn éo", "Hình mầm cây nảy mầm uốn lượn vượt qua lớp đất.", [["乞","qǐ","Cầu xin, ăn mày"], ["乳","rǔ","Sữa, nhũ hoa"], ["乾","gān","Khô ráo; quẻ Càn"]]],
  [6, "亅", "Quyết", 1, "jué", "Nét móc đứng ngược lên, cái móc câu", "Hình lưỡi câu hoặc chiếc móc gài đồ vật.", [["了","le","Trợ từ hoàn thành"], ["予","yǔ","Cho, ban tặng"], ["争","zhēng","Tranh giành"]]],

  // 2 strokes (23)
  [7, "二", "Nhị", 2, "èr", "Số hai, âm dương tương phối, đối ngẫu", "Hai nét ngang biểu thị trời và đất, nhị nguyên âm dương.", [["于","yú","Ở, tại, đối với"], ["五","wǔ","Số năm"], ["些","xiē","Một vài, một ít"]]],
  [8, "亠", "Đầu", 2, "tóu", "Nóc nhà, phần đỉnh trên cao", "Hình mái nhà hoặc đỉnh đầu cao nhất.", [["亡","wáng","Mất, tử vong"], ["交","jiāo","Giao lưu, kết bạn"], ["京","jīng","Kinh đô, thủ đô"]]],
  [9, "人 (亻)", "Nhân / Đơn nhân", 2, "rén", "Con người, hành vi liên quan đến con người", "Bắt nguồn từ hình dáng con người đứng nghiêng dang hai chân.", [["你","nǐ","Bạn, anh, chị"], ["他","tā","Anh ấy, người ấy"], ["休","xiū","Nghỉ ngơi (người dựa gốc cây)"]]],
  [10, "儿", "Nhi", 2, "ér", "Trẻ nhỏ, người trẻ tuổi, dáng người đi", "Hình đứa trẻ sơ sinh hoặc người đang bước đi nhanh nhẹn.", [["元","yuán","Đồng tệ, nguồn gốc"], ["光","guāng","Ánh sáng, quang minh"], ["先","xiān","Trước, tiên phong"]]],
  [11, "入", "Nhập", 2, "rù", "Vào, thâm nhập, tiếp nhận", "Hình hai dòng nước chảy chụm lại vào một chỗ.", [["内","nèi","Bên trong, nội bộ"], ["全","quán","Toàn bộ, hoàn chỉnh"], ["兩","liǎng","Hai, đôi, lượng"]]],
  [12, "八 (丷)", "Bát", 2, "bā", "Số tám, phân chia, tách rời ra hai bên", "Hình hai đường tách sang hai bên biểu thị sự chia cắt, phân ly.", [["公","gōng","Công cộng, ông"], ["六","liù","Số sáu"], ["分","fēn","Phân chia, phút"]]],
  [13, "冂", "Quynh", 2, "jiōng", "Vùng biên cương xa xôi, chu vi bao bọc", "Hình vùng đất hoang vu ngoài thành lũy.", [["册","cè","Cuốn sách, tập"], ["再","zài","Lại, lần nữa"], ["同","tóng","Cùng, giống nhau"]]],
  [14, "冖", "Mịch", 2, "mì", "Khăn phủ, nắp trùm, che đậy", "Hình tấm vải hoặc nắp vung phủ trùm lên đồ vật.", [["冗","rǒng","Thừa thãi, rườm rà"], ["冠","guān","Mũ miện, quán quân"], ["冥","míng","U minh, tối tăm"]]],
  [15, "冫", "Băng", 2, "bīng", "Băng giá, lạnh lẽo, đông cứng", "Hình những mảnh băng nứt vỡ sắc nhọn trong mùa đông lạnh.", [["冬","dōng","Mùa đông"], ["冷","lěng","Lạnh lẽo"], ["冻","dòng","Đông lạnh, đóng băng"]]],
  [16, "几", "Kỷ", 2, "jī", "Cái ghế dài, bàn nhỏ, bàn uống trà", "Hình chiếc bàn nhỏ có chân vững chãi trong nhà cổ.", [["凡","fán","Phàm trần, tầm thường"], ["凭","píng","Dựa vào, chứng cứ"], ["凰","huáng","Chim phượng hoàng"]]],
  [17, "凵", "Khảm", 2, "kǎn", "Hố sâu, thùng chứa, há miệng to", "Hình cái hố đào sâu dưới đất hoặc lòng chảo chứa đồ.", [["凶","xiōng","Hung dữ, tai họa"], ["凸","tū","Lồi ra"], ["凹","āo","Lõm vào"]]],
  [18, "刀 (刂)", "Đao / Đao đứng", 2, "dāo", "Con dao, thanh gươm, cắt gọt, vũ khí", "Hình con dao sắc bén có chuôi cầm và lưỡi cong.", [["切","qiē","Cắt, xẻ"], ["分","fēn","Chia cắt"], ["别","bié","Đừng, phân biệt"]]],
  [19, "力", "Lực", 2, "lì", "Sức lực, bắp thịt, công năng", "Hình cánh tay cơ bắp gồng lên hoặc chiếc cày đất cổ.", [["功","gōng","Công lao, võ công"], ["加","jiā","Cộng thêm, gia tăng"], ["动","dòng","Hành động, cử động"]]],
  [20, "勹", "Bao", 2, "bāo", "Bao bọc, ôm lấy, quấn quanh", "Hình người khom lưng ôm ấp đứa trẻ hoặc gói bọc đồ đạc.", [["包","bāo","Gói, túi xách, bao bọc"], ["勺","sháo","Cái thìa, cái muôi"], ["匀","yún","Đều đặn"]]],
  [21, "匕", "Chủy", 2, "bǐ", "Cái thìa nhỏ, con dao găm", "Hình cái muỗng múc cháo hoặc chiếc đoản kiếm sắc nhọn.", [["化","huà","Biến hóa, biến đổi"], ["北","běi","Phương Bắc"], ["匙","chí","Cái thìa múc súp"]]],
  [22, "匚", "Phương", 2, "fāng", "Hộp đựng đồ, khay chứa, hình chữ nhật", "Hình chiếc hòm vuông mở nắp bên sườn để cất giữ bảo vật.", [["匠","jiàng","Thợ thủ công tài ba"], ["匡","kuāng","Uốn nắn, giúp đỡ"], ["匣","xiá","Hộp đựng trâm"]]],
  [23, "匸", "Hệ", 2, "xì", "Che giấu, cất giấu đồ bí mật", "Hình chiếc rương kín giấu đồ vật khỏi tầm mắt.", [["匹","pǐ","Lượng từ ngựa, vải"], ["匿","nì","Ẩn nặc, giấu diếm"], ["区","qū","Khu vực"]]],
  [24, "十", "Thập", 2, "shí", "Số mười, hoàn hảo, đầy đủ bốn phương tám hướng", "Hình chữ thập giao thoa giữa kinh tuyến và vĩ tuyến, trọn vẹn thập toàn.", [["千","qiān","Một nghìn"], ["午","wǔ","Buổi trưa, chi Ngọ"], ["升","shēng","Thăng tiến, lít"]]],
  [25, "卜", "Bặc", 2, "bǔ", "Bói toán, vết nứt mai rùa thời thượng cổ", "Hình vết nứt trên yếm rùa khi nung nóng lửa để xem điềm lành dữ.", [["占","zhàn","Chiếm lĩnh, bói toán"], ["卡","kǎ","Thẻ, card"], ["卢","lú","Họ Lô, cái chậu"]]],
  [26, "卩 (⺋)", "Tiết", 2, "jié", "Đốt tre, quan ấn, người quỳ gối phục tùng", "Hình người đang quỳ gối kính cẩn hoặc ngọc tỉ của vua ban.", [["卫","wèi","Bảo vệ, vệ sinh"], ["印","yìn","Con dấu, in ấn"], ["却","què","Nhưng mà, lùi lại"]]],
  [27, "厂", "Hán", 2, "chǎng", "Vách đá nhô ra, xưởng làm việc", "Hình vách núi cao dựng đứng che mưa gió, sau này chỉ nhà xưởng.", [["厅","tīng","Phòng khách, đại sảnh"], ["历","lì","Lịch sử, trải qua"], ["原","yuán","Nguyên nhân, thảo nguyên"]]],
  [28, "厶", "Khư", 2, "sī", "Riêng tư, bản thân, ích kỷ", "Hình cánh tay co vào trong ngực ôm đồ vật về phần mình.", [["去","qù","Đi tới, rời khỏi"], ["参","cān","Tham gia, nhân sâm"], ["县","xiàn","Huyện, quận"]]],
  [29, "又", "Hựu", 2, "yòu", "Lại nữa, bàn tay phải nắm bắt", "Hình bàn tay phải đưa ra để cầm nắm, làm lại một hành động.", [["友","yǒu","Bạn bè"], ["双","shuāng","Đôi, cặp"], ["反","fǎn","Phản đối, quay lại"]]],

  // 3 strokes (31)
  [30, "口", "Khẩu", 3, "kǒu", "Miệng, lời nói, ăn uống, phát thanh", "Vẽ lại hình dáng cái miệng mở ra trò chuyện hoặc ăn uống.", [["吃","chī","Ăn"], ["喝","hē","Uống"], ["叫","jiào","Gọi, kêu tên"]]],
  [31, "囗", "Vi", 3, "wéi", "Bao quanh, thành lũy, chu vi khép kín", "Hình bốn bức tường thành khép kín bao quanh kinh đô.", [["国","guó","Quốc gia, đất nước"], ["因","yīn","Bởi vì, nguyên nhân"], ["回","huí","Quay về, trở lại"]]],
  [32, "土", "Thổ", 3, "tǔ", "Đất đai, thổ nhưỡng, công trình xây dựng", "Hình cột đất nhô lên từ mặt đất nuôi dưỡng vạn vật.", [["地","dì","Mặt đất, nơi chốn"], ["在","zài","Ở, tại, đang"], ["城","chéng","Thành phố, thành quách"]]],
  [33, "士", "Sĩ", 3, "shì", "Kẻ sĩ, trí thức, quan chức có học vấn", "Hình người trí thức thông hiểu đạo lý từ 1 đến 10.", [["壮","zhuàng","Tráng kiện, hùng vĩ"], ["声","shēng","Âm thanh, tiếng tăm"], ["壶","hú","Cái ấm trà"]]],
  [34, "夂", "Trĩ", 3, "zhǐ", "Đi chậm, bước đi từ phía sau", "Hình bàn chân đi sau chầm chậm, theo dấu người trước.", [["条","tiáo","Sợi, lượng từ đường"], ["冬","dōng","Mùa đông"], ["各","gè","Mỗi, các"]]],
  [35, "夊", "Tuy", 3, "suī", "Đi thong thả, bước đi kéo dài", "Hình bàn chân kéo lê trên đường thong thả.", [["复","fù","Phục hồi, lặp lại"], ["夏","xià","Mùa hạ, mùa hè"], ["夋","qūn","Kêu ngạo, đi chậm"]]],
  [36, "夕", "Tịch", 3, "xī", "Buổi chiều tối, đêm tối, mặt trăng khuyết", "Hình nửa vầng trăng khuyết ló dạng vào hoàng hôn chiều tà.", [["外","wài","Bên ngoài, ngoại quốc"], ["多","duō","Nhiều, đa dạng"], ["夜","yè","Ban đêm, đêm tối"]]],
  [37, "大", "Đại", 3, "dà", "To lớn, vĩ đại, bề thế", "Hình người trưởng thành dang rộng hai tay hai chân hiên ngang.", [["天","tiān","Bầu trời, ngày"], ["太","tài","Quá, rất"], ["夫","fū","Trượng phu, người chồng"]]],
  [38, "女", "Nữ", 3, "nǚ", "Phụ nữ, giống cái, dịu dàng", "Hình người phụ nữ đoan trang chắp tay quỳ gối duyên dáng.", [["好","hǎo","Tốt, đẹp"], ["妈","mā","Mẹ, mẫu thân"], ["她","tā","Cô ấy, bà ấy"]]],
  [39, "子", "Tử", 3, "zǐ", "Con cái, con trai, hạt mầm", "Hình đứa bé sơ sinh quấn tã đang vẫy hai tay mũm mĩm.", [["字","zì","Chữ viết, chữ Hán"], ["学","xué","Học tập"], ["孩","hái","Trẻ con, đứa bé"]]],
  [40, "宀", "Miên", 3, "mián", "Mái nhà, gian phòng, che chở ấm cúng", "Hình nóc nhà có mái dốc che mưa nắng cho gia đình.", [["家","jiā","Gia đình, nhà"], ["安","ān","An toàn, bình an"], ["字","zì","Chữ viết (nuôi con dưới mái nhà)"]]],
  [41, "寸", "Thốn", 3, "cùn", "Tấc đo lường, quy tắc, cữ đo mạch đập", "Hình bàn tay với dấu chấm tại huyệt thốn khẩu cổ tay đo mạch.", [["对","duì","Đúng, đối diện"], ["封","fēng","Bức thư, niêm phong"], ["耐","nài","Nhẫn nại, chịu đựng"]]],
  [42, "小", "Tiểu", 3, "xiǎo", "Nhỏ bé, ít ỏi, khiêm tốn", "Hình vật thể bị tách ra làm hai mảnh nhỏ xíu ở hai bên.", [["少","shǎo","Ít, thiếu niên"], ["尖","jiān","Mũi nhọn (trên nhỏ dưới to)"], ["尚","shàng","Cao thượng, tôn sùng"]]],
  [43, "尢 (尣)", "Uông", 3, "wāng", "Khập khiễng, dị tật chân, gầy gò", "Hình người đi chân cao chân thấp.", [["尤","yóu","Đặc biệt, lỗi lầm"], ["就","jiù","Thì, liền, ngay"], ["尬","gà","Lúng túng, bối rối"]]],
  [44, "尸", "Thi", 3, "shī", "Thi thể, dáng người nằm, nhà cửa", "Hình người đang nằm dài bất động hoặc mái chái nhà.", [["层","céng","Tầng, lớp"], ["屋","wū","Gian phòng, ngôi nhà"], ["居","jū","Cư trú, sinh sống"]]],
  [45, "屮", "Triệt", 3, "chè", "Mầm cỏ mới nhú lên mặt đất", "Hình chiếc mầm cây nhỏ vừa nhú chồi non đầu tiên.", [["屯","tún","Tập trung, đóng quân"], ["艸","cǎo","Cỏ cây"], ["芽","yá","Chồi non"]]],
  [46, "山", "Sơn", 3, "shān", "Núi non, đồi dốc, hiểm trở hùng vĩ", "Vẽ lại ba đỉnh núi sừng sững uy nghiêm giữa trời đất.", [["岁","suì","Tuổi, năm tháng"], ["岭","lǐng","Dãy núi, đỉnh đèo"], ["岸","àn","Bờ sông, bến bờ"]]],
  [47, "巛 (川)", "Xuyên", 3, "chuān", "Dòng sông chảy xiết, đường nước", "Hình các dòng nước uốn lượn chảy xuôi ra biển lớn.", [["州","zhōu","Châu, tỉnh thành"], ["顺","shùn","Thuận lợi, xuôi dòng"], ["巡","xún","Tuần tra, đi dạo"]]],
  [48, "工", "Công", 3, "gōng", "Công thợ, công cụ đo góc, kỹ thuật", "Hình thước đo góc vuông của người thợ mộc xưa.", [["左","zuǒ","Bên trái"], ["巧","qiǎo","Khéo léo, tình cờ"], ["差","chà","Kém, sai lệch"]]],
  [49, "己", "Kỷ", 3, "jǐ", "Bản thân mình, can Kỷ, sợi dây uốn", "Hình sợi dây hoặc con người tự gập mình khiêm nhường.", [["已","yǐ","Đã, đã rồi"], ["异","yì","Khác biệt, dị thường"], ["导","dǎo","Dẫn dắt, hướng dẫn"]]],
  [50, "巾", "Cân", 3, "jīn", "Khăn vải, tơ lụa, y phục", "Hình tấm khăn vải treo trên giá rủ xuống.", [["币","bì","Tiền tệ"], ["常","cháng","Thường xuyên, bình thường"], ["布","bù","Vải vóc, tuyên bố"]]],
  [51, "干", "Can", 3, "gān", "Cái khiên chắn, can thiệp, khô ráo", "Hình vũ khí chắn gươm giáo bảo vệ chiến sĩ.", [["平","píng","Bình an, bằng phẳng"], ["年","nián","Năm, tuổi tác"], ["幸","xìng","Hạnh phúc, may mắn"]]],
  [52, "幺", "Yêu", 3, "yāo", "Nhỏ bé, sợi tơ mỏng manh, số 1", "Hình cuộn tơ non mới kéo tơ mỏng manh.", [["幼","yòu","Ấu thơ, nhỏ tuổi"], ["幻","huàn","Huyễn hoặc, ảo tưởng"], ["幽","yōu","U tối, u nhã"]]],
  [53, "广", "Quảng", 3, "guǎng", "Ngôi nhà rộng lớn tựa vách núi, quảng trường", "Hình gian nhà lớn xây tựa lưng vào sườn núi.", [["庄","zhuāng","Trang viên, trang nghiêm"], ["庆","qìng","Chúc mừng, kỷ niệm"], ["底","dǐ","Đáy, phía dưới"]]],
  [54, "廴", "Dẫn", 3, "yǐn", "Bước dài, đi xa, kéo dài", "Hình bước chân sải dài kiên trì trên con đường lớn.", [["延","yán","Kéo dài, trì hoãn"], ["廷","tíng","Triều đình"], ["建","jiàn","Xây dựng, kiến thiết"]]],
  [55, "廾", "Củng", 3, "gǒng", "Hai tay chắp lại, cung kính nâng đồ vật", "Hình hai bàn tay chắp lại nâng đồ tế lễ thần linh.", [["开","kāi","Mở ra, lái xe"], ["弃","qì","Vứt bỏ, từ bỏ"], ["弄","nòng","Làm, nghịch ngợm"]]],
  [56, "弋", "Dặc", 3, "yì", "Mũi tên có buộc dây, cọc cắm", "Hình mũi tên có dây thừng bắn chim săn thú rồi kéo lại.", [["式","shì","Hình thức, công thức"], ["弑","shì","Giết vua chúa"], ["贰","èr","Số hai viết hoa"]]],
  [57, "弓", "Cung", 3, "gōng", "Cây cung, uốn cong gập ghềnh", "Hình cây cung uốn cong có căng dây sắc bén.", [["张","zhāng","Mở rộng, họ Trương"], ["引","yǐn","Dẫn dắt, lôi cuốn"], ["强","qiáng","Mạnh mẽ, kiên cường"]]],
  [58, "彐 (彑)", "Ký", 3, "jì", "Đầu con nhím, chân thú cào", "Hình bàn chân con thú có móng vuốt sắc.", [["归","guī","Trở về, quy tụ"], ["当","dāng","Đảm đương, khi mà"], ["录","lù","Ghi chép, thu âm"]]],
  [59, "彡", "Sâm", 3, "shān", "Lông dài, hoa văn, râu tóc mỹ miều", "Hình những nét vẽ trang trí hoa văn rực rỡ hay chòm râu.", [["形","xíng","Hình dáng, hình thức"], ["彩","cǎi","Màu sắc, rực rỡ"], ["影","yǐng","Cái bóng, điện ảnh"]]],
  [60, "彳", "Xích", 3, "chì", "Bước chân trái, ngã tư đường, đi dạo", "Hình nửa bên trái của ngã tư đường đi bộ.", [["很","hěn","Rất"], ["行","xíng","Đi, được, ngành nghề"], ["往","wǎng","Đi về phía, dĩ vãng"]]],

  // 4 strokes (34)
  [61, "心 (忄/㣺)", "Tâm / Thấu tâm", 4, "xīn", "Trái tim, tình cảm, tư duy, cảm xúc", "Hình quả tim với các buồng tâm thất và dòng máu chảy.", [["想","xiǎng","Nghĩ, nhớ mong"], ["快","kuài","Nhanh nhẹn, vui vẻ"], ["懂","dǒng","Hiểu thấu suốt"]]],
  [62, "戈", "Qua", 4, "gē", "Cây giáo, vũ khí chiến đấu cổ", "Hình ngọn mác dài có lưỡi ngang dùng trên chiến xa xưa.", [["我","wǒ","Tôi, bản thân"], ["或","huò","Hoặc là, có lẽ"], ["战","zhàn","Chiến đấu, chiến tranh"]]],
  [63, "戶 (户)", "Hộ", 4, "hù", "Cánh cửa đơn, gia đình, hộ khẩu", "Hình một cánh cửa gỗ che chắn lối vào tổ ấm.", [["房","fáng","Căn phòng, gian nhà"], ["所","suǒ","Nơi chốn, cơ quan"], ["扇","shàn","Cái quạt, cánh cửa"]]],
  [64, "手 (扌)", "Thủ / Đề thủ", 4, "shǒu", "Bàn tay, thao tác, nắm bắt, hành động", "Hình năm ngón tay xòe ra thao tác linh hoạt mọi việc.", [["打","dǎ","Đánh, chơi thể thao"], ["找","zhǎo","Tìm kiếm"], ["拿","ná","Cầm, nắm lấy"]]],
  [65, "支", "Chi", 4, "zhī", "Cành cây, chi nhánh, nâng đỡ, hỗ trợ", "Hình bàn tay nắm lấy một cành cây nhỏ.", [["收","shōu","Thu nhận, dọn dẹp"], ["架","jià","Giá đỡ, cãi nhau"], ["鼓","gǔ","Cái trống"]]],
  [66, "攴 (攵)", "Phác", 4, "pū", "Gõ nhẹ, đánh nhẹ, đốc thúc", "Hình bàn tay cầm roi nhỏ đánh nhẹ để răn dạy học trò.", [["收","shōu","Thu nhận"], ["改","gǎi","Sửa đổi, cải cách"], ["放","fàng","Thả ra, phóng thích"]]],
  [67, "文", "Văn", 4, "wén", "Chữ viết, văn học, văn minh, hoa văn", "Hình hoa văn xăm trên ngực người dũng cảm thời cổ.", [["斌","bīn","Văn võ song toàn"], ["斑","bān","Đốm vằn"], ["斋","zhāi","Thư phòng, ăn chay"]]],
  [68, "斗", "Đẩu", 4, "dǒu", "Cái đấu đong gạo, chòm sao Bắc Đẩu", "Hình cái gáo múc nước có cán dài múc ngũ cốc.", [["料","liào","Vật liệu, dự đoán"], ["斜","xié","Nghiêng, xéo"], ["斟","zhēn","Rót rượu, cân nhắc"]]],
  [69, "斤", "Cân", 4, "jīn", "Cái rìu sắt, cân trọng lượng (0.5kg)", "Hình chiếc rìu đẵn gỗ sắc bén dùng làm đơn vị cân.", [["新","xīn","Mới mẻ, tươi mới"], ["断","duàn","Đoạn tuyệt, đứt gãy"], ["斯","sī","Chốn này, như vậy"]]],
  [70, "方", "Phương", 4, "fāng", "Hình vuông, phương hướng, cách thức", "Hình hai chiếc thuyền ghép đôi song song lái theo hướng định sẵn.", [["放","fàng","Đặt để, thả ra"], ["旅","lǚ","Du lịch, lữ hành"], ["施","shī","Thi hành, ban ơn"]]],
  [71, "无 (旡)", "Vô", 4, "wú", "Không có, trống rỗng, hư vô", "Hình vũ nữ múa tay uyển chuyển trong không gian bao la.", [["既","jì","Đã, đã rồi"], ["芜","wú","Hoang vu cỏ dại"], ["旡","jì","Nghẹn ngào"]]],
  [72, "日", "Nhật", 4, "rì", "Mặt trời, ban ngày, thời gian ngày tháng", "Hình tròn mặt trời rực sáng có đốm đen ở tâm.", [["明","míng","Sáng sủa, thông minh"], ["早","zǎo","Sớm, buổi sáng"], ["晴","qíng","Trời quang đãng"]]],
  [73, "曰", "Viết", 4, "yuē", "Nói rằng, phát biểu lời dạy thánh hiền", "Hình miệng mở ra phát ra luồng hơi ấm truyền đạt lời hay.", [["曲","qū","Khúc hát, uốn khúc"], ["更","gèng","Càng, hơn nữa"], ["曹","cáo","Họ Tào, chức quan"]]],
  [74, "月", "Nguyệt", 4, "yuè", "Mặt trăng, tháng, thịt bắp (biến thể Nhục)", "Hình vầng trăng lưỡi liềm tỏa sáng êm dịu ban đêm.", [["朋","péng","Bằng hữu, bạn thân"], ["期","qī","Kỳ hạn, thời kỳ"], ["朝","zhāo","Buổi sớm, triều đại"]]],
  [75, "木", "Mộc", 4, "mù", "Cây cối, gỗ, thực vật thân gỗ", "Hình cây cổ thụ có rễ đâm sâu dưới đất và cành xòe rộng.", [["本","běn","Gốc rễ, cuốn sách"], ["李","lǐ","Quả mận, họ Lý"], ["机","jī","Máy móc, cơ hội"]]],
  [76, "欠", "Khiếm", 4, "qiàn", "Ngáp ngủ, há miệng hít thở, thiếu thốn", "Hình người quỳ gối há to miệng ngáp vì mệt mỏi.", [["次","cì","Lần, thứ bậc"], ["歌","gē","Bài hát, ca khúc"], ["欢","huān","Hoan hỷ, vui mừng"]]],
  [77, "止", "Chỉ", 4, "zhǐ", "Dừng lại, đứng yên, ngăn cấm", "Hình bàn chân đứng yên cố định không tiến bước nữa.", [["正","zhèng","Chính xác, ngay thẳng"], ["此","cǐ","Chỗ này, cái này"], ["步","bù","Bước chân, tiến bộ"]]],
  [78, "歹 (歺)", "Đãi", 4, "dǎi", "Xương tàn, chết chóc, tồi tệ, hiểm ác", "Hình mẩu xương vụn gãy nát sau khi phân hủy.", [["死","sǐ","Chết, mất mạng"], ["殊","shū","Đặc thù, khác biệt"], ["残","cán","Tàn nhẫn, tàn dư"]]],
  [79, "殳", "Thù", 4, "shū", "Cây gậy tre nhọn, vũ khí tấn công", "Hình bàn tay cầm cây gậy dài đầu bọc đồng.", [["段","duàn","Đoạn văn, giai đoạn"], ["殷","yīn","Ân cần, triều Ân"], ["殿","diàn","Điện thờ, cung điện"]]],
  [80, "毋 (母)", "Vô / Mẫu", 4, "wú", "Chớ, đừng, người mẹ hiền từ", "Hình người mẹ ôm con có hai giọt sữa nuôi dưỡng.", [["每","měi","Mỗi, từng"], ["毒","dú","Độc hại, chất độc"], ["贯","guàn","Xâu chuỗi, quán triệt"]]],
  [81, "比", "Tỷ", 4, "bǐ", "So sánh, liền kề nhau, tỷ lệ", "Hình hai người đứng sát cạnh nhau để đọ chiều cao.", [["毖","bì","Cẩn trọng răn dè"], ["毗","pí","Liền kề, giáp ranh"], ["毕","bì","Tốt nghiệp, hoàn tất"]]],
  [82, "毛", "Mao", 4, "máo", "Lông, sợi tóc, lông mao loài thú", "Hình chùm lông thú mềm mại uốn lượn trước gió.", [["毫","háo","Mảy may, ngòi bút lông"], ["毯","tǎn","Tấm thảm len"], ["毽","jiàn","Quả cầu lông đá"]]],
  [83, "氏", "Thị", 4, "shì", "Dòng họ, thị tộc, người nổi tiếng", "Hình cây gậy đầu rồng tượng trưng cho quyền lực gia tộc.", [["民","mín","Nhân dân, thường dân"], ["氓","máng","Dân lưu vong, côn đồ"], ["氐","dī","Tên bộ tộc cổ"]]],
  [84, "气", "Khí", 4, "qì", "Khí trời, hơi nước bốc lên, hơi thở", "Hình các luồng mây hơi nước cuồn cuộn bay lên bầu trời.", [["汽","qì","Hơi nước, xe hơi"], ["氛","fēn","Bầu không khí"], ["氧","yǎng","Khí oxy dưỡng khí"]]],
  [85, "水 (氵/氺)", "Thủy / Tam chấm thủy", 4, "shuǐ", "Nước, sông hồ, chất lỏng", "Hình dòng sông cuồn cuộn chảy giữa hai bờ cát.", [["江","jiāng","Sông lớn, Trường Giang"], ["河","hé","Dòng sông, Hoàng Hà"], ["海","hǎi","Biển cả mênh mông"]]],
  [86, "火 (灬)", "Hỏa / Tứ điểm hỏa", 4, "huǒ", "Lửa, nhiệt độ, bốc cháy, nấu nướng", "Hình ngọn lửa bùng cháy bập bùng với tia lửa phát ra.", [["灯","dēng","Ngọn đèn, bóng điện"], ["热","rè","Nóng nực, nhiệt tình"], ["点","diǎn","Chấm điểm, thắp lửa"]]],
  [87, "爪 (爫)", "Trảo", 4, "zhǎo", "Móng vuốt chim muông thú dữ", "Hình bàn chân có móng vuốt quắp sắc nhọn vồ mồi.", [["爬","pá","Bò, leo trèo"], ["爱","ài","Tình yêu (tay nâng trái tim)"], ["采","cǎi","Hái hoa, chọn lọc"]]],
  [88, "父", "Phụ", 4, "fù", "Người cha, bậc tiền bối bề trên", "Hình bàn tay người cha cầm chiếc roi nghiêm khắc chỉ dạy con cái.", [["爸","bà","Bố, cha ruột"], ["爷","yé","Ông nội, quý ông"], ["爹","diē","Thân phụ, cha già"]]],
  [89, "爻", "Hào", 4, "yáo", "Vạch quẻ Kinh Dịch, đan kết giao nhau", "Hình các que bói đan chéo biểu hiện biến dịch càn khôn.", [["爽","shuǎng","Sảng khoái, vui vẻ"], ["尔","ěr","Ngươi, bạn hữu"], ["俎","zǔ","Chiếc thớt tế lễ"]]],
  [90, "爿", "Tường", 4, "qiáng", "Mảnh ván gỗ xẻ đôi bên trái, chiếc giường nằm", "Hình nửa bên trái của thân cây gỗ xẻ đôi.", [["状","zhuàng","Trạng thái, hình dáng"], ["将","jiāng","Tương lai, tướng quân"], ["壮","zhuàng","Khỏe mạnh, tráng kiện"]]],
  [91, "片", "Phiến", 4, "piàn", "Mảnh ván gỗ mỏng bên phải, tấm thẻ, lát mỏng", "Hình nửa bên phải của thân cây xẻ ra làm thanh mỏng.", [["版","bǎn","Phiên bản, bản in"], ["牌","pái","Tấm biển, lá bài"], ["物","wù","Đồ vật, vạn vật"]]],
  [92, "牙", "Nha", 4, "yá", "Răng hàm, ngà voi, ngàm kẹp", "Hình những chiếc răng nanh cài chéo ăn khớp vào nhau.", [["芽","yá","Chồi cây, mầm non"], ["蚜","yá","Con rệp hút nhựa"], ["鸦","yā","Con quạ đen"]]],
  [93, "牛 (牜)", "Ngưu", 4, "niú", "Con bò, con trâu, tính siêng năng", "Hình đầu trâu nhìn thẳng với hai sừng cong vút và đôi tai vểnh.", [["物","wù","Đồ vật, sự vật"], ["特","tè","Đặc biệt, độc đáo"], ["件","jiàn","Lượng từ chiếc, việc"]]],
  [94, "犬 (犭)", "Khuyển", 4, "quǎn", "Chó, động vật ăn thịt bốn chân", "Hình con chó đứng gầm gừ giương đuôi dũng mãnh.", [["狗","gǒu","Con chó cưng"], ["猫","māo","Con mèo"], ["猪","zhū","Con lợn, con heo"]]],

  // 5 strokes (23)
  [95, "玄", "Huyền", 5, "xuán", "Màu đen sâu thẳm, huyền bí, vũ trụ vi diệu", "Màu sắc đen pha sắc đỏ huyền ảo của bầu trời đêm vô tận.", [["率","lǜ","Tỷ lệ, suất"], ["玆","zī","Năm này, điều này"], ["弦","xián","Dây đàn, dây cung"]]],
  [96, "玉 (王)", "Ngọc / Vương", 5, "yù", "Đá ngọc quý, vua chúa, phẩm hạnh cao quý", "Hình ba miếng ngọc quý xâu bằng một sợi dây thẳng tắp.", [["国","guó","Đất nước (giữ ngọc trong thành)"], ["现","xiàn","Hiện tại, xuất hiện"], ["玩","wán","Chơi đùa, đồ chơi"]]],
  [97, "瓜", "Qua", 5, "guā", "Dưa, bầu, các loại quả dây leo", "Hình quả dưa tròn trĩu nặng lúc lỉu trên giàn lá leo.", [["瓣","bàn","Cánh hoa, múi bưởi"], ["瓠","hù","Quả bầu dài"], ["瓢","piáo","Chiếc gáo múc nước"]]],
  [98, "瓦", "Ngõa", 5, "wǎ", "Ngói nung, đồ sành sứ tráng men", "Hình những viên ngói lợp đan cài che kín mái nhà.", [["瓷","cí","Đồ gốm sứ tinh xảo"], ["瓶","píng","Bình hoa, cái chai"], ["甑","zèng","Cái chõ đồ xôi nung"]]],
  [99, "甘", "Cam", 5, "gān", "Ngọt ngào, ngon miệng, cam tâm", "Hình vật ngọt ngào ngậm chặt nơi đầu lưỡi.", [["甜","tián","Vị ngọt mát"], ["甚","shèn","Rất, thậm chí"], ["某","mǒu","Người nào đó, mỗ"]]],
  [100, "生", "Sinh", 5, "shēng", "Sinh sôi, nảy nở, sống sót, học sinh", "Hình ngọn cỏ non xanh tốt đâm chồi vươn lên từ mặt đất ấm áp.", [["产","chǎn","Sản xuất, tài sản"], ["甥","shēng","Cháu ngoại trai"], ["甦","sū","Hồi sinh lại"]]],
  [101, "用", "Dụng", 5, "yòng", "Sử dụng, công dụng, hữu ích", "Hình chiếc thùng gỗ chắc chắn dùng đựng nước hàng ngày.", [["甩","shuǎi","Vung tay, ném vứt"], ["甫","fǔ","Vừa mới, tên chữ"], ["庸","yōng","Tầm thường, trung dung"]]],
  [102, "田", "Điền", 5, "tián", "Ruộng lúa, thửa ruộng chia bờ, nông nghiệp", "Hình mảnh đất vuông vức chia làm 4 luống cày cấy.", [["男","nán","Đàn ông (dùng sức làm ruộng)"], ["町","tīng","Bờ ruộng"], ["界","jiè","Ranh giới, thế giới"]]],
  [103, "疋 (⺪)", "Thất", 5, "pǐ", "Cuộn vải, chân bước đi, đơn vị đo vải", "Hình cẳng chân và bàn chân người đang rảo bước.", [["疏","shū","Sơ sài, thông suốt"], ["疑","yí","Hoài nghi, thắc mắc"], ["蛋","dàn","Quả trứng"]]],
  [104, "疒", "Nạch", 5, "nè", "Bệnh tật, ốm đau, nằm trên giường bệnh", "Hình người bệnh sốt nằm nghiêng trên giường rên rỉ.", [["病","bìng","Bị bệnh, đau ốm"], ["痛","tòng","Đau đớn, nhức nhối"], ["瘦","shòu","Gầy gò, ốm yếu"]]],
  [105, "癶", "Bát", 5, "bō", "Hai bàn chân giạng ngược nhau, giẫm đạp", "Hình hai bàn chân hướng ngược nhau khi leo núi dốc.", [["癸","guǐ","Can Quý"], ["登","dēng","Leo trèo, đăng tải"], ["发","fā","Phát triển, gửi đi"]]],
  [106, "白", "Bạch", 5, "bái", "Màu trắng tinh khiết, sáng tỏ, rõ ràng", "Hình tia nắng mặt trời rạng rỡ vừa hé qua rèm cửa.", [["百","bǎi","Một trăm"], ["的","de","Trợ từ sở hữu"], ["皇","huáng","Hoàng đế uy quyền"]]],
  [107, "皮", "Bì", 5, "pí", "Da thú, lớp vỏ ngoài che chắn", "Hình bàn tay cầm dao cẩn thận lột tấm da thú nguyên vẹn.", [["破","pò","Bị rách, phá vỡ"], ["波","bō","Làn sóng biếc"], ["彼","bǐ","Kia, người kia"]]],
  [108, "皿", "Mãnh", 5, "mǐn", "Dụng cụ đựng thức ăn, đĩa chén, bát đũa", "Hình chiếc đĩa sâu lòng đựng đồ ăn thức uống trên bàn tiệc.", [["盆","pén","Cái chậu rửa mặt"], ["盘","pán","Cái đĩa, bàn cờ"], ["盒","hé","Cái hộp kín"]]],
  [109, "目", "Mục", 5, "mù", "Mắt, nhìn ngắm, danh mục", "Hình con mắt mở to có tròng đen và mí mắt tinh tường.", [["看","kàn","Nhìn, xem sách"], ["眼","yǎn","Đôi mắt"], ["睛","jīng","Con ngươi mắt"]]],
  [110, "矛", "Mâu", 5, "máo", "Cây giáo nhọn đâm thủng giáp, vũ khí mâu thuẫn", "Hình ngọn giáo cán dài có mũi nhọn bằng đồng chĩa thẳng.", [["柔","róu","Mềm dẻo, nhu hòa"], ["矜","jīn","Kiêu ngạo, thương hại"], ["豫","yù","Do dự, thoải mái"]]],
  [111, "矢", "Thỉ", 5, "shǐ", "Mũi tên bay thẳng, lời thề thẳng thắn", "Hình mũi tên có đuôi gắn lông chim bay vút chuẩn xác.", [["知","zhī","Biết, tri thức (lời nói sắc như tên)"], ["短","duǎn","Ngắn ngủn"], ["矮","ǎi","Thấp bé, lùn"]]],
  [112, "石", "Thạch", 5, "shí", "Hòn đá, vách đá cứng cỏi, đá tảng", "Hình tảng đá lăn dưới chân vách núi dựng đứng.", [["研","yán","Nghiên cứu (mài đá mịn)"], ["破","pò","Phá vỡ (đá đập vỡ)"], ["碗","wǎn","Cái bát ăn cơm"]]],
  [113, "示 (礻)", "Thị / Kỳ", 5, "shì", "Bàn thờ, thần linh, điềm báo linh thiêng", "Hình bàn thờ tế trời đất ban phước lành may mắn.", [["祝","zhù","Chúc mừng, cầu nguyện"], ["福","fú","Phúc lành, hạnh phúc"], ["票","piào","Tấm vé, phiếu bầu"]]],
  [114, "禸", "Nhựu", 5, "róu", "Dấu chân muông thú dẫm trên đất mềm", "Hình vết móng vuốt chân cọp in hằn trong rừng.", [["禹","yǔ","Vua Đại Vũ trị thủy"], ["离","lí","Rời xa, ly biệt"], ["禽","qín","Gia cầm, loài chim"]]],
  [115, "禾", "Hòa", 5, "hé", "Cây lúa mạch chín trĩu bông vàng, mùa màng", "Hình thân cây lúa cúi đầu trước gió vì bông trĩu hạt.", [["和","hé","Hòa bình, và"], ["秋","qiū","Mùa thu thu hoạch lúa"], ["种","zhǒng","Giống nòi, gieo trồng"]]],
  [116, "穴", "Huyệt", 5, "xué", "Hang động, hố sâu dưới lòng đất, huyệt đạo", "Hình cửa hang đào khoét sâu trong lòng núi để trú ẩn.", [["空","kōng","Trống rỗng, bầu trời"], ["穿","chuān","Xỏ qua, mặc áo"], ["究","jiù","Cứu cánh, nghiên cứu"]]],
  [117, "立", "Lập", 5, "lì", "Đứng thẳng hiên ngang, thành lập, tự lập", "Hình người đứng vững hai chân dang rộng trên nền đất bằng phẳng.", [["亲","qīn","Người thân, thân thiết"], ["童","tóng","Nhi đồng, trẻ thơ"], ["端","duān","Đoan trang, đầu mối"]]],

  // 6 strokes (29)
  [118, "竹 (⺮)", "Trúc", 6, "zhú", "Cây tre, ống nứa, đốt tre thanh cao", "Hình hai nhánh lá tre rủ xuống mộc mạc kiên cường.", [["笑","xiào","Cười tươi rạng rỡ"], ["第","dì","Thứ bậc, xếp hạng"], ["等","děng","Chờ đợi, đẳng cấp"]]],
  [119, "米", "Mễ", 6, "mǐ", "Hạt gạo, ngũ cốc, lương thực thiết yếu", "Hình các hạt thóc bung nở trên cành lúc đập lúa.", [["糖","táng","Đường ngọt, kẹo"], ["料","liào","Nguyên liệu, tài liệu"], ["类","lèi","Chủng loại, thể loại"]]],
  [120, "糸 (纟)", "Mịch", 6, "mì", "Sợi tơ lụa, liên kết, dệt may", "Hình các cuộn tơ tằm óng ả bện chặt thành dây thừng.", [["红","hóng","Màu đỏ tươi thắm"], ["细","xì","Tế nhị, nhỏ bé"], ["经","jīng","Kinh qua, kinh sách"]]],
  [121, "缶", "Phẫu", 6, "fǒu", "Bình gốm đất nung, vò đựng rượu", "Hình vò rượu đất nung có nắp đậy kín hương thơm.", [["缺","quē","Thiếu thốn, vỡ mẻ"], ["缸","gāng","Cái chum, vại lớn"], ["罐","guàn","Lon, hộp thiếc"]]],
  [122, "网 (罒/罓)", "Võng", 6, "wǎng", "Tấm lưới đánh cá, mạng lưới pháp luật", "Hình các mắt lưới đan chéo săn bắt chim cá.", [["罗","luó","Họ La, giăng bắt"], ["罚","fá","Hình phạt, xử phạt"], ["罩","zhào","Cái lồng bàn, che đậy"]]],
  [123, "羊 (⺶)", "Dương", 6, "yáng", "Con dê, con cừu, hiền lành tốt đẹp", "Hình đầu con cừu nhìn thẳng với hai sừng xoắn cong mỹ lệ.", [["美","měi","Tươi đẹp (dê to béo)"], ["群","qún","Quần thể, bầy đàn"], ["着","zhe","Đang, mặc vào"]]],
  [124, "羽", "Vũ", 6, "yǔ", "Lông vũ, cánh chim bay liệng", "Hình hai chiếc lông cánh chim đối xứng mềm mại đón gió.", [["翻","fān","Lật giở, phiên dịch"], ["翼","yì","Đôi cánh chim"], ["扇","shān","Quạt mát"]]],
  [125, "老 (耂)", "Lão", 6, "lǎo", "Người già, bậc cao niên, kinh nghiệm", "Hình ông lão chống gậy tóc dài bạc trắng ung dung.", [["者","zhě","Kẻ, người thực hiện"], ["考","kǎo","Khảo thí, thi cử"], ["孝","xiào","Hiếu thảo với cha mẹ"]]],
  [126, "而", "Nhi", 6, "ér", "Chòm râu mép, và, mà lại (liên từ)", "Hình những sợi râu dài buông xuống dưới cằm các cụ già.", [["耐","nài","Nhẫn nại, chịu đựng"], ["耍","shuǎ","Chơi đùa, múa may"], ["端","duān","Đầu mối"]]],
  [127, "耒", "Lỗi", 6, "lěi", "Cái cày gỗ, dụng cụ xới đất thời cổ", "Hình chiếc cày xới đất nông nghiệp có tay cầm uốn cong.", [["耕","gēng","Cày cấy ruộng đồng"], ["耘","yún","Làm cỏ ruộng"], ["耗","hào","Hao tổn, tiêu hao"]]],
  [128, "耳", "Nhĩ", 6, "ěr", "Tai, thính giác, lắng nghe lời hay", "Hình vành tai mở rộng đón nhận âm thanh bốn phương.", [["听","tīng","Lắng nghe"], ["闻","wén","Nghe ngóng, tin tức"], ["聪","cōng","Thông minh (tai thính mắt tinh)"]]],
  [129, "聿 (⺻)", "Duật", 6, "yù", "Cây bút lông, viết lách, văn thư", "Hình bàn tay cầm cây bút lông thẳng đứng viết chữ lên thẻ tre.", [["肃","sù","Nghiêm túc, trang trọng"], ["肄","yì","Học tập, tu nghiệp"], ["肆","sì","Cửa hàng, phóng túng"]]],
  [130, "肉 (⺼)", "Nhục", 6, "ròu", "Thịt, cơ bắp, thân thể con người", "Hình miếng thịt tươi có những thớ cơ nạc và mỡ đan xen.", [["胖","pàng","Mập mạp, béo tốt"], ["背","bèi","Lưng, học thuộc"], ["脸","liǎn","Gương mặt, thể diện"]]],
  [131, "臣", "Thần", 6, "chén", "Bề tôi, quan lại, cúi đầu phụng sự", "Hình đôi mắt cúi gằm xuống cung kính trước bậc quân vương.", [["卧","wò","Nằm ngủ"], ["臧","zāng","Thiện lương, họ Tang"], ["临","lín","Đến gần, lâm nạn"]]],
  [132, "自", "Tự", 6, "zì", "Tự bản thân, từ đâu đến, cái mũi", "Người xưa chỉ vào mũi của mình khi nói về bản thân.", [["臭","chòu","Hôi hám (chó ngửi thấy)"], ["息","xī","Hơi thở, nghỉ ngơi"], ["鼻","bí","Chiếc mũi"]]],
  [133, "至", "Chí", 6, "zhì", "Đến nơi, cùng cực, chí thân", "Hình mũi tên rơi cắm phập xuống mặt đất điểm đích.", [["倒","dào","Ngã đổ, rót nước"], ["致","zhì","Dẫn đến, tinh tế"], ["台","tái","Lầu đài, bàn bục"]]],
  [134, "臼", "Cữu", 6, "jiù", "Cái cối giã gạo, răng hàm nghiền nát", "Hình chiếc cối bằng đá có những vết khắc rãnh bên trong.", [["舂","chōng","Giã gạo bằng chày"], ["舅","jiù","Cậu ruột (anh em mẹ)"], ["舆","yú","Dư luận, cỗ xe"]]],
  [135, "舌", "Thiệt", 6, "shé", "Lưỡi, nếm vị giác, lời ăn tiếng nói", "Hình chiếc lưỡi thò ra khỏi miệng nhấm nháp món ngon.", [["甜","tián","Vị ngọt ngào"], ["乱","luàn","Rối loạn, bừa bãi"], ["适","shì","Thích hợp, vừa vặn"]]],
  [136, "舛", "Suyễn", 6, "chuǎn", "Sai lệch, bước chân trái ngược, trắc trở", "Hình hai bàn chân quay lưng ngược hướng nhau.", [["舜","shùn","Vua Thuấn thời cổ"], ["舞","wǔ","Khiêu vũ, múa lượn"], ["桀","jié","Vua Kiệt tàn bạo"]]],
  [137, "舟", "Chu", 6, "zhōu", "Chiếc thuyền nan, con đò lướt sóng", "Hình chiếc thuyền độc mộc lướt trên mặt hồ phẳng lặng.", [["船","chuán","Tàu thuyền lớn"], ["航","háng","Hàng hải, hàng không"], ["般","bān","Tổng loại, bình thường"]]],
  [138, "艮", "Cấn", 6, "gèn", "Bền bỉ, ngoảnh lại nhìn, quẻ Cấn (núi)", "Hình người trừng mắt ngoảnh đầu lại nhìn cương nghị.", [["很","hěn","Rất, cực kỳ"], ["根","gēn","Gốc rễ cây cỏ"], ["眼","yǎn","Đôi mắt sáng"]]],
  [139, "色", "Sắc", 6, "sè", "Màu sắc, sắc thái tình cảm, nhan sắc", "Hình thần thái biểu lộ trên gương mặt người đối thoại.", [["艳","yàn","Diễm lệ, sặc sỡ"], ["绝","jué","Tuyệt đỉnh, tuyệt giao"], ["巴","bā","Mong mỏi, bám dính"]]],
  [140, "艸 (艹)", "Thảo", 6, "cǎo", "Cỏ non, thực vật thân thảo, hoa lá", "Hình hai bụi cỏ non mơn mởn xanh tốt trên đồng nội.", [["花","huā","Bông hoa tươi thắm"], ["茶","chá","Lá trà thơm"], ["草","cǎo","Cỏ cây, cỏ dại"]]],
  [141, "虍 (虎)", "Hổ", 6, "hū", "Con hổ chúa sơn lâm, vằn hổ oai nghiêm", "Hình con hổ vằn đứng gầm vang rúng động núi rừng.", [["虚","xū","Hư vô, khiêm tốn"], ["虑","lǜ","Lo nghĩ, suy tư"], ["虔","qián","Thành kính, kiền thành"]]],
  [142, "虫", "Trùng", 6, "chóng", "Sâu bọ, côn trùng, bò sát, rắn rết", "Hình con rắn hoặc sâu nhỏ cuộn mình cử động linh hoạt.", [["虽","suī","Mặc dù"], ["蛇","shé","Con rắn"], ["蜜","mì","Mật ong ngọt mát"]]],
  [143, "血", "Huyết", 6, "xuè", "Máu đỏ, huyết mạch, lòng nhiệt huyết", "Hình giọt máu tế lễ nhỏ vào đĩa dâng cúng tổ tiên.", [["衅","xìn","Khiêu khích, hằn học"], ["衄","nǜ","Chảy máu mũi, nản lòng"], ["众","zhòng","Đông đảo quần chúng"]]],
  [144, "行", "Hành", 6, "xíng", "Đi lại, hành động, đường phố ngã tư", "Hình ngã tư đường phố tấp nập người qua lại.", [["街","jiē","Đường phố, phố xá"], ["衡","héng","Cân bằng, đo lường"], ["律","lǜ","Quy luật, kỷ luật"]]],
  [145, "衣 (衤)", "Y", 6, "yī", "Quần áo, trang phục, che thân ấm áp", "Hình chiếc áo cổ dài cài vạt chéo sang bên phải.", [["装","zhuāng","Trang phục, lắp đặt"], ["袋","dài","Cái túi, bao tải"], ["裤","kù","Cái quần dài"]]],
  [146, "襾 (覀)", "Á", 6, "yà", "Nắp đậy che phủ, phương Tây (Tây)", "Hình cái nắp vung đậy kín đồ đạc, sau này mượn làm hướng Tây.", [["要","yào","Cần, muốn"], ["覆","fù","Bao phủ, lật đổ"], ["霸","bà","Bá chủ, bá đạo"]]],

  // 7 strokes (20)
  [147, "見 (见)", "Kiến", 7, "jiàn", "Nhìn thấy, gặp gỡ, nhận thức sáng suốt", "Hình người có đôi mắt mở to nhìn ngắm khám phá thế giới.", [["规","guī","Quy định, quy tắc"], ["视","shì","Thị giác, xem"], ["觉","jué","Cảm giác, giấc ngủ"]]],
  [148, "角", "Giác", 7, "jiǎo", "Sừng động vật, góc cạnh, hào tiền", "Hình chiếc sừng trâu nhọn hoắt có vân cứng rắn.", [["解","jiě","Giải thích, tháo gỡ"], ["触","chù","Tiếp xúc, chạm vào"], ["触","chù","Va chạm"]]],
  [149, "言 (讠)", "Ngôn", 7, "yán", "Lời nói, ngôn ngữ, đàm thoại", "Hình luồng hơi lời nói phát ra từ miệng trung thực chân thành.", [["话","huà","Lời nói, trò chuyện"], ["说","shuō","Nói năng"], ["语","yǔ","Ngữ văn, tiếng nói"]]],
  [150, "谷", "Cốc", 7, "gǔ", "Thung lũng sâu, khe núi có suối róc rách", "Hình dòng suối chảy ra từ hẻm vực giữa hai sườn núi.", [["豁","huò","Rộng mở, miễn trừ"], ["容","róng","Bao dung, dung mạo"], ["欲","yù","Ham muốn, dục vọng"]]],
  [151, "豆", "Đậu", 7, "dòu", "Hạt đậu, cái chén cao chân đựng thịt tế", "Hình chiếc bát tế có chân cao và nắp đậy trang trọng.", [["短","duǎn","Ngắn ngủn"], ["豉","chǐ","Đậu xị, tương đậu"], ["豊","lǐ","Phong phú, nghi lễ"]]],
  [152, "豕", "Thỉ", 7, "shǐ", "Con lợn, con heo béo tốt", "Hình chú lợn bụng tròn đuôi ngắn chân to chắc nịch.", [["象","xiàng","Con voi, hình tượng"], ["豪","háo","Hào hoa, anh hào"], ["豫","yù","Do dự, hoan hỷ"]]],
  [153, "豸", "Trĩ", 7, "zhì", "Thú dữ ăn thịt không sừng, lưng dài", "Hình con báo hoặc thú dữ đang rình mồi uốn lưng.", [["豹","bào","Con báo hoa mai"], ["貌","mào","Dung mạo, vẻ ngoài"], ["豺","chái","Chó rừng hung dữ"]]],
  [154, "貝 (贝)", "Bối", 7, "bèi", "Vỏ sò ốc, tiền tệ thời cổ đại, của cải", "Vỏ sò biển quý giá được dùng làm đơn vị tiền tệ giao thương.", [["买","mǎi","Mua hàng"], ["卖","mài","Bán hàng"], ["贵","guì","Đắt đỏ, cao quý"]]],
  [155, "赤", "Xích", 7, "chì", "Màu đỏ rực, lòng son, trần trụi", "Hình ngọn lửa hỏa nung đỏ mặt đất bằng ánh sáng rực rỡ.", [["赦","shè","Ân xá, tha thứ"], ["赫","hè","Hiển hách, rực rỡ"], ["赭","zhě","Màu đỏ đất son"]]],
  [156, "走 (赱)", "Tẩu", 7, "zǒu", "Đi lại, chạy trốn, dạo bước", "Hình người vung tay rảo bước chân chạy thật nhanh.", [["起","qǐ","Thức dậy, khởi đầu"], ["超","chāo","Siêu cấp, vượt qua"], ["赶","gǎn","Đuổi kịp, vội vã"]]],
  [157, "足 (𧾷)", "Túc", 7, "zú", "Chân, bàn chân, đầy đủ trọn vẹn", "Hình cẳng chân và bàn chân vững chãi nâng đỡ cơ thể.", [["跑","pǎo","Chạy bộ"], ["跳","tiào","Nhảy cao"], ["路","lù","Con đường đi"]]],
  [158, "身", "Thân", 7, "shēn", "Thân thể, vóc dáng, người phụ nữ mang thai", "Hình người đứng nghiêng có bụng to mang nặng mầm sống.", [["射","shè","Bắn tên"], ["躲","duǒ","Trốn tránh, né tránh"], ["躯","qū","Thân thể, thân xác"]]],
  [159, "車 (车)", "Xa", 7, "chē", "Xe cộ, cỗ xe ngựa thời xưa", "Hình chiếc xe có hai bánh gỗ và trục xe vững chắc kéo bằng ngựa.", [["辆","liàng","Lượng từ chiếc xe"], ["转","zhuǎn","Chuyển hướng, xoay"], ["轻","qīng","Nhẹ nhàng, thanh thoát"]]],
  [160, "辛", "Tân", 7, "xīn", "Cay nồng, vất vả, dao thích chữ phạm nhân", "Hình con dao nhọn dùng xăm chữ lên trán tội nhân thời cổ.", [["辣","là","Cay xè lưỡi"], ["辩","biàn","Biện luận, tranh cãi"], ["辟","pì","Khai khẩn, trừ bỏ"]]],
  [161, "辰", "Thần", 7, "chén", "Chi Thìn (con rồng), thời khắc, cày cấy", "Hình chiếc vỏ sò dùng xới đất khi vào mùa cày cấy đầu năm.", [["辱","rǔ","Sỉ nhục, hổ thẹn"], ["农","nóng","Nông nghiệp, nông dân"], ["晨","chén","Buổi sớm mai"]]],
  [162, "辵 (辶)", "Sước", 7, "chuò", "Chợt đi chợt dừng, bước đi trên đường dài", "Hình bàn chân bước đi trên con đường thiên lý gập ghềnh.", [["过","guò","Trải qua, đi qua"], ["进","jìn","Tiến vào bên trong"], ["这","zhè","Cái này, ở đây"]]],
  [163, "邑 (阝-hữu)", "Ấp", 7, "yì", "Làng mạc, thành thị, khu dân cư", "Hình thành quách và con người tụ họp sinh sống bên phải chữ.", [["都","dōu","Tất cả, thủ đô"], ["部","bù","Bộ phận, bộ ngành"], ["邻","lín","Hàng xóm láng giềng"]]],
  [164, "酉", "Dậu", 7, "yǒu", "Chi Dậu, vò rượu ủ lên men, say sưa", "Hình bình rượu đóng kín đang tỏa men say ngây ngất.", [["酒","jiǔ","Rượu ngon"], ["配","pèi","Phối hợp, xứng đáng"], ["酸","suān","Vị chua chát"]]],
  [165, "釆", "Biện", 7, "biàn", "Phân biệt, móng vuốt thú để lại dấu vết", "Hình vết chân thú để lại trên đất giúp người thợ săn nhận biết.", [["释","shì","Giải thích, buông bỏ"], ["釉","yòu","Men tráng đồ sứ"], ["番","fān","Lượt, phen"]]],
  [166, "里", "Lý", 7, "lǐ", "Dặm đường (500m), thôn làng, bên trong", "Gồm ruộng (Điền) và đất (Thổ), nơi dân định cư cày cấy.", [["重","zhòng","Nặng nề, quan trọng"], ["野","yě","Hoang dã, cánh đồng"], ["量","liàng","Số lượng, cân đong"]]],

  // 8 strokes (9)
  [167, "金 (钅)", "Kim", 8, "jīn", "Kim loại, vàng bạc, của cải quý giá", "Khoáng sản kim loại quý chôn giấu sâu trong lòng đất cát.", [["钱","qián","Tiền bạc"], ["错","cuò","Sai sót, lẫn lộn"], ["钟","zhōng","Đồng hồ, chuông reo"]]],
  [168, "長 (长)", "Trường", 8, "cháng", "Dài, xa xôi, người lớn tuổi, phát triển", "Hình ông lão tóc dài buông rủ qua lưng tiêu dao.", [["张","zhāng","Mở rộng"], ["肆","sì","Cửa hàng lớn"], ["套","tào","Vỏ bọc, bộ trang phục"]]],
  [169, "門 (门)", "Môn", 8, "mén", "Cánh cửa lớn hai cánh, cổng làng, môn học", "Hình chiếc cổng thành uy nghiêm có hai cánh then cài chắc chắn.", [["问","wèn","Hỏi han (mở miệng hỏi ở cửa)"], ["间","jiān","Gian phòng, khoảng cách"], ["关","guān","Đóng cửa, quan hệ"]]],
  [170, "阜 (阝-tả)", "Phụ", 8, "fù", "Gò đất cao, đồi núi trập trùng, giàu có", "Hình các bậc thang đất đắp cao phòng ngự bên trái chữ.", [["阳","yáng","Mặt trời rạng, Dương"], ["阴","yīn","Bóng râm, Âm"], ["院","yuàn","Học viện, sân nhà"]]],
  [171, "隶", "Đãi", 8, "lì", "Bắt kịp, nô lệ, trực thuộc", "Hình bàn tay với bắt lấy người hầu hoặc con thú chạy.", [["隶","lì","Trực thuộc, nô lệ"], ["康","kāng","An khang thịnh vượng"], ["逮","dài","Bắt giữ, tóm lấy"]]],
  [172, "隹", "Chuy", 8, "zhuī", "Chim đuôi ngắn, loài chim sẻ nhỏ", "Hình chú chim sẻ nhỏ mập mạp lông mượt đậu cành cây.", [["难","nán","Khó khăn"], ["虽","suī","Mặc dù"], ["集","jí","Tập hợp, hội tụ"]]],
  [173, "雨", "Vũ", 8, "yǔ", "Mưa rơi, sấm sét, hiện tượng khí quyển", "Hình bầu trời mây dầy đổ những giọt mưa rào mát rượi.", [["雪","xuě","Tuyết trắng mùa đông"], ["零","líng","Số không, tí tách"], ["雷","léi","Sấm sét rền vang"]]],
  [174, "靑 (青)", "Thanh", 8, "qīng", "Màu xanh biếc, tuổi trẻ thanh xuân", "Màu xanh tươi của cây cỏ non hòa cùng khoáng vật thanh nhã.", [["静","jìng","Yên tĩnh, thanh tịnh"], ["靓","liàng","Đẹp đẽ, sáng láng"], ["靛","diàn","Màu chàm đậm"]]],
  [175, "非", "Phi", 8, "fēi", "Sai trái, không phải, phản đối, hai cánh chim", "Hình hai cánh chim xòe ngược hướng nhau biểu thị bất đồng.", [["靠","kào","Dựa vào, cậy nhờ"], ["靡","mí","Hao mòn, lãng phí"], ["悲","bēi","Bi thương buồn bã"]]],

  // 9 strokes (11)
  [176, "面", "Diện", 9, "miàn", "Mặt mũi, diện mạo, bề mặt, sợi mì", "Hình khuôn mặt người tròn đầy có mắt mũi và ranh giới rõ ràng.", [["靥","yè","Má lúm đồng tiền"], ["腼","miǎn","Bẽn lẽn thẹn thùng"], ["靦","tiǎn","Mặt dày, trơ trẽn"]]],
  [177, "革", "Cách", 9, "gé", "Da thuộc, cải cách, thay đổi trang phục", "Tấm da thú sau khi cạo lông nướng lửa để làm giáp chiến.", [["鞋","xié","Đôi giày đi chân"], ["靴","xuē","Đôi bốt da cao cổ"], ["鞭","biān","Cây roi da ngựa"]]],
  [178, "韋 (韦)", "Vi", 9, "wéi", "Da mềm bao quanh, vây quanh phòng thủ", "Miếng da thuộc mềm mại dùng bọc vòng quanh đồ vật.", [["韧","rèn","Dẻo dai, kiên trì"], ["韩","hán","Hàn Quốc, họ Hàn"], ["韬","tāo","Thao lược giấu kín"]]],
  [179, "韭", "Cửu", 9, "jiǔ", "Cây rau hẹ, cắt rồi lại mọc bền bỉ", "Hình những lá rau hẹ thơm tốt tươi mọc sum suê sau mưa.", [["韭","jiǔ","Rau hẹ thơm xào"], ["韱","xiān","Cỏ non xanh"], ["韲","jī","Rau muối chua cay"]]],
  [180, "音", "Âm", 9, "yīn", "Âm thanh, giai điệu, tiếng lòng thốt ra", "Lời nói (Ngôn) có tiết tấu hài hòa êm dịu đi vào lòng người.", [["韵","yùn","Vần điệu thơ ca"], ["韶","sháo","Âm nhạc thánh thót"], ["响","xiǎng","Vang dội, to lớn"]]],
  [181, "頁 (页)", "Hiệt", 9, "yè", "Trang sách, đầu người, trang giấy", "Hình cái đầu người to lớn ngẩng cao suy ngẫm việc đời.", [["顶","dǐng","Đỉnh đầu, đội trên đầu"], ["领","lǐng","Cổ áo, dẫn dắt"], ["题","tí","Đề bài, chủ đề"]]],
  [182, "風 (风)", "Phong", 9, "fēng", "Gió thổi, phong tục, phong thái", "Luồng gió chuyển động vạn vật sinh sôi sâu bọ cựa mình.", [["飘","piāo","Bay lượn bồng bềnh"], ["飙","biāo","Cơn cuồng phong"], ["飒","sà","Gió thổi rì rào"]]],
  [183, "飛 (飞)", "Phi", 9, "fēi", "Bay lượn trên bầu trời cao, phi hành", "Hình chú chim dang rộng đôi cánh tung bay trên không trung.", [["飞","fēi","Bay liệng trên trời"], ["飜","fān","Bay lượn nhào lộn"], ["飝","fēi","Ba cánh chim cùng bay"]]],
  [184, "食 (饣)", "Thực", 9, "shí", "Ăn uống, thức ăn, lương thực nuôi sống", "Hình chiếc nồi có nắp đậy chứa cơm thơm nuôi sống con người.", [["饭","fàn","Bữa cơm gia đình"], ["饮","yǐn","Đồ uống giải khát"], ["饱","bǎo","No nê đẫy đà"]]],
  [185, "首", "Thủ", 9, "shǒu", "Đầu não, thủ lĩnh, bài thơ, ban đầu", "Hình đầu người có tóc cài trâm trang nghiêm lãnh đạo.", [["道","dào","Đạo lý, con đường"], ["馗","kuí","Ngã tư đường"], ["馘","guó","Cắt tai giặc đếm công"]]],
  [186, "香", "Hương", 9, "xiāng", "Mùi thơm ngọt, hương thơm ngát, ngon lành", "Mùi thơm của bông lúa chín (Hòa) tỏa ra ngọt mát nơi miệng (Cam).", [["馥","fù","Hương thơm nồng nàn"], ["馨","xīn","Hương thơm bay xa"], ["馡","fēi","Mùi thơm ngát mũi"]]],

  // 10 strokes (8)
  [187, "馬 (马)", "Mã", 10, "mǎ", "Con ngựa phi nhanh, chiến mã dũng mãnh", "Hình chú tuấn mã có bờm tung bay trước gió bốn vó phi nước đại.", [["骑","qí","Cưỡi ngựa, xe đạp"], ["驾","jià","Lái xe, ngự giá"], ["验","yàn","Khảo nghiệm, kiểm tra"]]],
  [188, "骨", "Cốt", 10, "gǔ", "Xương cốt, khung xương, phẩm cách cứng cỏi", "Hình bộ khung xương chống đỡ cơ thể vững chắc.", [["骼","gé","Bộ xương cốt người"], ["髓","suǐ","Tủy xương quý báu"], ["髅","lóu","Đầu lâu, hài cốt"]]],
  [189, "高", "Cao", 10, "gāo", "Chiều cao, cao cả, lầu cao nguy nga", "Hình lầu gác cao vút xây trên cổng thành kiên cố.", [["亮","liàng","Sáng sủa, vang dội"], ["亭","tíng","Cái đình nghỉ chân"], ["豪","háo","Hào hoa phong nhã"]]],
  [190, "髟", "Bưu", 10, "biāo", "Tóc dài bay trong gió, chòm râu dài", "Hình mái tóc dài buông rủ tha thướt của người phụ nữ.", [["鬃","zōng","Bờm ngựa chiến"], ["髻","jì","Búi tóc cài trâm"], ["鬚","xū","Chòm râu dài"]]],
  [191, "鬥 (斗)", "Đấu", 10, "dòu", "Đấu đá, tranh giành, đọ sức giao chiến", "Hình hai người nắm tay vung đấm lao vào giao đấu quyết liệt.", [["闹","nào","Náo nhiệt, ồn ào"], ["阄","jiū","Bốc thăm phân chia"], ["鬪","dòu","Chiến đấu quyết tử"]]],
  [192, "鬯", "Sưởng", 10, "chàng", "Rượu nếp thơm dâng tế thần linh, thông suốt", "Bình rượu thảo mộc thơm phức nấu bằng gạo nếp dâng trời cao.", [["郁","yù","U uất, nồng nàn"], ["鬯","chàng","Rượu cúng tế"], ["鬰","yù","Cây cỏ rậm rạp"]]],
  [193, "鬲", "Cách", 10, "lì", "Nồi đất ba chân rỗng, dụng cụ nấu ăn cổ", "Hình chiếc nồi gốm cổ có 3 chân rỗng giúp lửa dẫn nhiệt nhanh.", [["融","róng","Hòa hợp, tan chảy"], ["鬻","yù","Buôn bán, nấu cháo"], ["鬵","xín","Chiếc nồi đất to"]]],
  [194, "鬼", "Quỷ", 10, "guǐ", "Hồn ma, ma quỷ, biến hóa khôn lường", "Hình người chết đội mặt nạ quái dị có bước chân thoắt ẩn thoắt hiện.", [["魔","mó","Ma quỷ mê hoặc"], ["魂","hún","Linh hồn con người"], ["魄","pò","Phách khí, dũng cảm"]]],

  // 11 strokes (6)
  [195, "魚 (鱼)", "Ngư", 11, "yú", "Con cá bơi lội, dư dả dồi dào", "Hình chú cá chép quẫy đuôi có vây và vảy bơi lội tung tăng.", [["鲜","xiān","Tươi ngon, thanh tao"], ["鲁","lǔ","Chậm chạp, họ Lỗ"], ["鲸","jīng","Cá voi khổng lồ"]]],
  [196, "鳥 (鸟)", "Điểu", 11, "niǎo", "Loài chim bay, lông đuôi dài uyển chuyển", "Hình chú chim có mắt tinh tường chiếc mỏ nhọn và lông đuôi óng ả.", [["鸭","yā","Con vịt bơi hồ"], ["鸡","jī","Con gà trống gáy"], ["鸣","míng","Tiếng chim hót líu lo"]]],
  [197, "鹵 (卤)", "Lỗ", 11, "lǔ", "Đất mặn, muối hạt, món kho đậm vị", "Hình ruộng muối kết tinh thành những hạt muối trắng tinh khiết.", [["咸","xián","Vị mặn mòi biển"], ["碱","jiǎn","Chất kiềm"], ["卤","lǔ","Món kho ngũ vị"]]],
  [198, "鹿", "Lộc", 11, "lù", "Con hươu sao, tài lộc may mắn", "Hình chú nai rừng có cặp sừng phân nhánh đứng giữa đồng cỏ ngút ngàn.", [["丽","lì","Xinh đẹp, lộng lẫy"], ["麝","shè","Con hươu xạ thơm"], ["麓","lù","Chân núi non ngút ngàn"]]],
  [199, "麥 (麦)", "Mạch", 11, "mài", "Cây lúa mì, bột mì làm bánh", "Cây lúa mạch có râu dài hạt no tròn được gieo từ mùa đông lạnh.", [["面","miàn","Bột mì, sợi mì ngon"], ["麴","qū","Men làm rượu bia"], ["麸","fū","Cám gạo lúa mì"]]],
  [200, "麻", "Ma", 11, "má", "Cây gai dầu, vải gai, tê rần", "Cây sợi gai được cất trong nhà kho để tước sợi dệt áo ấm.", [["摩","mó","Xoa bóp, ma sát"], ["磨","mó","Mài giũa, nghiền bột"], ["魔","mó","Yêu ma ma quỷ"]]],

  // 12 strokes (4)
  [201, "黃 (黄)", "Hoàng", 12, "huáng", "Màu vàng hoàng kim, đất đai trung thổ", "Màu sắc của ngọc bội quý đeo bên hông người vương giả.", [["黉","hóng","Trường học của vua"], ["黌","hóng","Trường quốc học"], ["潢","huáng","Hồ nước rộng"]]],
  [202, "黍", "Thử", 12, "shǔ", "Cây kê dính, làm bánh nếp kê thơm ngọt", "Hình cây kê trĩu hạt dính dẻo dùng để ủ các loại rượu thơm.", [["黎","lí","Lê dân bá tánh"], ["黏","nián","Dính chặt, nhớp nhúa"], ["黐","chī","Nhựa cây dính chim"]]],
  [203, "黑", "Hắc", 12, "hēi", "Màu đen tuyền, bóng đêm mịt mù", "Hình bồ hóng và khói lửa đọng lại đen nhánh trên ống khói.", [["默","mò","Im lặng, trầm ngâm"], ["点","diǎn","Chấm đen, điểm số"], ["黛","dài","Màu chì kẻ lông mày"]]],
  [204, "黹", "Chỉ", 12, "zhǐ", "Thêu thùa may vá, hoa văn tinh tế", "Hình kim chỉ thêu những hoa văn rồng phượng lên áo dạ tiệc.", [["黼","fǔ","Hoa văn thêu rìu búa"], ["黻","fú","Hoa văn chữ á trên áo"], ["黹","zhǐ","Công việc may thêu"]]],

  // 13 strokes (4)
  [205, "黽 (黾)", "Mãnh", 13, "mǐn", "Con ếch, con cóc, nỗ lực cố gắng", "Hình chú ếch bụng to mắt tròn ngồi bên bờ ao mùa mưa ngâu.", [["鼋","yuán","Con giải khổng lồ"], ["鼍","tuó","Con cá sấu sông"], ["黾","mǐn","Cố gắng nỗ lực hết mình"]]],
  [206, "鼎", "Đỉnh", 13, "dǐng", "Vạc ba chân, đỉnh đồng báu vật quốc gia", "Báu vật đỉnh đồng tượng trưng cho vương quyền và sự vững như bàn thạch.", [["鼐","nài","Chiếc đỉnh đồng cực đại"], ["鼒","zī","Chiếc đỉnh miệng nhỏ"], ["鼎","dǐng","Tam túc đỉnh lập"]]],
  [207, "鼓", "Cổ", 13, "gǔ", "Cái trống da, đánh trống thôi thúc lòng quân", "Hình chiếc trống bịt da đứng trên giá và bàn tay cầm dùi gõ vang rền.", [["鼗","táo","Cái trống lắc tay"], ["鼙","pí","Trống nhỏ trên lưng ngựa"], ["瞽","gǔ","Người khiếm thị làm nhạc công"]]],
  [208, "鼠", "Thử", 13, "shǔ", "Con chuột nhanh nhẹn, chi Tý", "Hình chú chuột nhỏ đang gặm nhấm thức ăn chiếc đuôi uốn dài.", [["鼬","yòu","Con chồn hôi"], ["鼯","wú","Con sóc bay"], ["鼹","yǎn","Chuột chũi đào hang"]]],

  // 14 strokes (2)
  [209, "鼻", "Tị", 14, "bí", "Chiếc mũi hít thở, khởi đầu nguồn gốc", "Gồm chữ Tự (tự mình - chiếc mũi) và bộ phận thở nhận biết mùi vị.", [["鼾","hān","Ngáy khò khò khi ngủ"], ["齇","zhā","Mũi đỏ vì rượu"], ["齉","nàng","Nghẹt mũi nói giọng đục"]]],
  [210, "齊 (齐)", "Tề", 14, "qí", "Ngay ngắn, bằng nhau, tề gia trị quốc", "Hình những bông lúa chín vàng đều tăm tắp thẳng hàng trên đồng.", [["斋","zhāi","Trai giới, thư phòng"], ["齑","jī","Rau băm nhỏ trộn gia vị"], ["霁","jì","Trời quang mây tạnh"]]],

  // 15 strokes (1)
  [211, "齒 (齿)", "Xỉ", 15, "chǐ", "Răng hàm, tuổi tác đời người", "Hình miệng mở ra để lộ hai hàm răng xếp đều đặn nhai nghiền.", [["龄","líng","Tuổi tác, thâm niên"], ["龈","yín","Lợi răng, nướu răng"], ["龌","wò","Bẩn thỉu, chật hẹp"]]],

  // 16 strokes (2)
  [212, "龍 (龙)", "Long", 16, "lóng", "Con rồng bay lượn, uy quyền linh thiêng", "Linh vật thần thoại thân rắn vảy cá móng vuốt chim ưng bay lượn trên mây.", [["庞","páng","To lớn đồ sộ, họ Bàng"], ["龚","gōng","Họ Cung, cung kính"], ["龛","kān","Bàn thờ, am nhỏ"]]],
  [213, "龜 (龟)", "Quy", 16, "guī", "Con rùa trường thọ, mai rùa khắc chữ", "Hình chú rùa có mai mai cứng và bốn chân đầu ngẩng cao sống ngàn năm.", [["龟","guī","Rùa biển thọ lâu"], ["鳖","biē","Con ba ba"], ["阄","jiū","Bốc thăm"]]],

  // 17 strokes (1)
  [214, "龠", "Dược", 17, "yuè", "Ống sáo trúc ba lỗ, hòa âm nhã nhạc", "Hình chiếc sáo trúc cổ ba lỗ thổi lên những khúc ca thái bình thịnh trị.", [["龢","hé","Hòa thuận êm ấm"], ["龡","chuī","Thổi sáo thổi kèn"], ["籲","yù","Kêu gọi, van nài"]]]
];

const formattedData = RADICALS_RAW.map(item => {
  const [number, radical, name, strokes, pinyin, meaning, etymology, rawExamples] = item;
  const exampleCharacters = rawExamples.map(([char, py, mn]) => ({
    char,
    pinyin: py,
    meaning: mn
  }));

  return {
    number,
    radical,
    name,
    strokes,
    pinyin,
    meaning,
    etymology,
    exampleCharacters
  };
});

const content = `/**
 * HánNgữ Pro - Kangxi Radicals & Character Etymology Data
 * Toàn bộ chuẩn xác 214 Bộ thủ Khang Hy (康熙部首) từ 1 nét đến 17 nét
 * Đầy đủ âm Hán-Việt, Pinyin, số nét, chiết tự, ý nghĩa văn hóa và chữ Hán ví dụ thực tế.
 */

export const RADICALS_DATA = ${JSON.stringify(formattedData, null, 2)};
`;

const targetPath = path.resolve(__dirname, '../src/data/radicalsData.js');
fs.writeFileSync(targetPath, content, 'utf8');
console.log(`✓ Successfully generated ${formattedData.length} Kangxi radicals in ${targetPath}`);
