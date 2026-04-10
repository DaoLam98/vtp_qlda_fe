/**
 * @usage Cho phép nhập tiếng Việt hợp lệ (bao gồm chữ cái tiếng Việt có dấu, số, và dấu cách)
 * và các kí tự đặc biệt theo 1.5.8 : Quy tắc kí tự đặc biệt.
 * Sử dụng cho cách trưởng nhập tên
 */
export const VIETNAMESE_REGEX = /^[A-Z0-9ỲỌÁẦẢẤỜỄÀẠẰỆẾÝỘẬỐŨỨĨÕÚỮỊỖÌỀỂẨỚẶÒÙỒỢÃỤỦÍỸẮẪỰỈỎỪỶỞÓÉỬỴẲẸÈẼỔẴẺỠƠÔƯĂÊÂĐa-zỳọáầảấờễàạằệếýộậốũứĩõúữịỗìềểẩớặòùồợãụủíỹắẫựỉỏừỷởóéửỵẳẹèẽổẵẻỡơôưăêâđ()._\-\s]+$/;
/**
 * @usage Cho phép nhập các kí tự A-Z, a-z, 0-9 (không cho phép nhập tiếng Việt và dấu cách)
 * và các kí tự đặc biệt theo 1.5.8 : Quy tắc kí tự đặc biệt.
 * Sử dụng cho các trường nhập mã
 */
export const DEFAULT_REGEX = /^[a-zA-Z0-9().\-_]*$/;
/**
 * @usage Chỉ cho phép nhập số 0-9z
 * Sử dụng cho các trường nhập số điện thoại
 */
export const ONLY_NUMBER_REGEX = /^[0-9]*$/;
/**
 * @usage Cho phép nhập các kí tự A-Z, a-z, 0-9, dấu chấm, dấu "_", dấu "-" (không cho phép nhập tiếng Việt và dấu cách)
 * Sử dụng cho các trường nhập email
 */

export const NUMBER_DEFAULT = /^[0-9.,]*$/;
/**
 * @usage Cho phép nhập các kí tự A-Z, a-z, 0-9, dấu chấm, dấu "_", dấu "-" (không cho phép nhập tiếng Việt và dấu cách)
 * Sử dụng cho các trường nhập email
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
/**
 * @usage Sử dụng cho các trường nhập giờ dạng HH:mm
 */
export const HOUR_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
/**
 * @usage Sử dụng cho trường "Tên" của Hash tag, giống DEFAULT_REGEX nhưng chấp nhận thêm dấu "#"
 */
export const HASH_TAG_REGEX = /^[a-zA-Z0-9().\-_#]*$/;
/**
 * @usage Chỉ cho phép nhập số 1-9z
 * Sử dụng cho các trường nhập số thứ tự
 */
export const ONLY_NUMBER_ORDER_REGEX = /^(0|[1-9]\d*)$/;


