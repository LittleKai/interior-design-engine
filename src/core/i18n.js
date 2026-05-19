export const DESIGN_DIRECTIONS = [
  {
    id: "practical-modern",
    nameVi: "Hiện đại thực dụng",
    nameEn: "Practical modern",
    promptVi: "nội thất hiện đại thực dụng, đường nét gọn, tỉ lệ rõ, ưu tiên công năng hằng ngày",
    promptEn: "practical modern interior, clean lines, clear proportions, daily-use functionality first",
    materialVi: "laminate chống trầy hoặc veneer sáng màu, phụ kiện kim loại đen mờ",
    materialEn: "durable laminate or light veneer, matte black metal hardware"
  },
  {
    id: "warm-japandi",
    nameVi: "Japandi gỗ ấm",
    nameEn: "Warm Japandi",
    promptVi: "Japandi ấm, tối giản mềm, gỗ sáng, khoảng trống thoáng, cảm giác yên tĩnh",
    promptEn: "warm Japandi, soft minimalism, pale timber, breathable negative space, quiet atmosphere",
    materialVi: "gỗ sồi sáng, veneer tần bì, bề mặt satin, vải và tường trung tính",
    materialEn: "pale oak, ash veneer, satin finish, neutral walls and textiles"
  },
  {
    id: "compact-luxury",
    nameVi: "Sang trọng gọn diện tích",
    nameEn: "Compact luxury",
    promptVi: "nội thất compact luxury, mảng tối có kiểm soát, kính khói, chi tiết kim loại sắc nét",
    promptEn: "compact luxury interior, controlled dark accents, smoked glass, crisp metal details",
    materialVi: "veneer óc chó tối, kính khói, kim loại champagne hoặc đen, ánh sáng hắt ấm",
    materialEn: "dark walnut veneer, smoked glass, champagne or black metal, warm accent lighting"
  }
];

export const INTAKE_CHECKLIST = [
  {
    id: "site-measurements",
    vi: "Kích thước hiện trạng: rộng, cao, sâu, trần, cột, dầm, chân tường.",
    en: "Site measurements: width, height, depth, ceiling, columns, beams, baseboards."
  },
  {
    id: "reference-assets",
    vi: "Ảnh hiện trạng và ảnh cảm hứng: tường, sàn, cửa, cửa sổ, vật liệu thích.",
    en: "Reference assets: current room photos and inspiration for walls, floor, openings, materials."
  },
  {
    id: "fixed-services",
    vi: "Điểm cố định: ổ điện, công tắc, điều hòa, cửa gió, ống kỹ thuật, thiết bị cần giữ.",
    en: "Fixed services: outlets, switches, AC, vents, pipes, and appliances that must stay."
  },
  {
    id: "storage-program",
    vi: "Công năng lưu trữ: quần áo treo, ngăn kéo, kệ mở, bàn làm việc, thiết bị, đồ đặc biệt.",
    en: "Storage program: hanging clothes, drawers, open shelves, desk, appliances, special items."
  },
  {
    id: "style-budget",
    vi: "Phong cách, vật liệu, ngân sách và mức ưu tiên giữa đẹp, bền, dễ thi công.",
    en: "Style, materials, budget, and priority between appearance, durability, buildability."
  }
];

export const I18N = {
  vi: {
    tabs: {
      front: "Mặt đứng",
      side: "Mặt ngang",
      plan: "Mặt bằng",
      "3d": "3D",
      specs: "Thông số"
    },
    headerBadge: {
      width: "Rộng",
      height: "Cao",
      depth: "Sâu"
    },
    notes: {
      planView: "Render từ cùng model: modules là khối chính, details là cánh/kệ/ray/tay nắm/phụ kiện.",
      view3d: "Kéo để xoay, cuộn để zoom, chuột phải để pan.",
      view3dHint: "3D dùng cùng module và detail với ba mặt chính, nên đổi kích thước sẽ đồng bộ."
    },
    view3d: {
      dimensionsOn: "Hiển thị kích thước",
      dimensionsOff: "Ẩn kích thước",
      paletteLabel: "Bảng màu",
      paletteHint: "Đổi bảng màu để xem trước nội thất với màu khác"
    },
    palette: {
      "wood-oak": { label: "Sồi vàng" },
      "wood-walnut": { label: "Óc chó" },
      "laminate-white": { label: "Trắng laminate" },
      "dark-modern": { label: "Hiện đại tối" }
    },
    template: {
      notFound: "Không tìm thấy template: {id}",
      evalError: "Lỗi tính toán biểu thức: {message}"
    },
    upload: {
      title: "Phân tích ảnh phòng",
      desc: "Tải ảnh phòng hoặc ảnh tham chiếu, AI sẽ chuyển thành model thiết kế.",
      dropLabel: "Kéo thả ảnh vào đây hoặc bấm để chọn.",
      hintsLabel: "Gợi ý cho AI (tùy chọn)",
      hintsPlaceholder: "Tủ áo built-in, phòng ngủ master, 2.8m × 2.4m, gỗ óc chó tối...",
      btnAnalyze: "Phân tích",
      statusResizing: "Đang nén ảnh...",
      statusUploading: "Đang tải lên...",
      statusAnalyzing: "AI đang phân tích...",
      statusDone: "Hoàn tất.",
      statusError: "Có lỗi khi phân tích.",
      errNoFile: "Chưa chọn ảnh.",
      modelMeta: "Mô hình AI",
      cached: "đã cache",
      labelBefore: "Ảnh gốc",
      labelAfter: "Render 3D"
    },
    editor: {
      title: "Sửa chi tiết",
      empty: "Bấm vào một chi tiết trên bản vẽ để chỉnh sửa.",
      fieldLabel: "Tên",
      fieldWidth: "Rộng",
      fieldHeight: "Cao",
      fieldDepth: "Sâu",
      fieldColor: "Màu",
      fieldMaterial: "Vật liệu",
      fieldCatalog: "Catalog",
      materialNone: "(không gán)",
      catalogNone: "(không gán)",
      undo: "Hoàn tác",
      redo: "Làm lại",
      deleteSelected: "Xóa chi tiết"
    },
    history: {
      title: "Lịch sử",
      empty: "Chưa có thay đổi",
      current: "Hiện tại",
      preview: "Xem",
      restore: "Phục hồi",
      close: "Đóng",
      banner: "Đang xem phiên bản cũ",
      relative: {
        justNow: "vừa xong",
        minutesAgo: "{n} phút trước",
        hoursAgo: "{n} giờ trước"
      }
    },
    specs: {
      totalWidth: "Tổng chiều rộng",
      totalWidthNote: "Dùng cho mặt đứng, mặt bằng và 3D",
      totalHeight: "Tổng chiều cao",
      totalHeightNote: "Dùng cho mặt đứng và mặt ngang",
      totalDepth: "Tổng chiều sâu tủ",
      totalDepthNote: "Chiều sâu thân tủ chính",
      moduleCount: "Số module",
      moduleCountNote: "Khối chính của thiết kế",
      detailCount: "Số chi tiết",
      detailCountNote: "Cánh, ray, kệ, tay nắm, phụ kiện và đồ nội thất"
    },
    review: {
      title: "Review nhanh trước khi xuất ảnh AI",
      subtitle: "Kiểm tra sơ bộ công năng, hình học, vật liệu và mức đủ chi tiết của model.",
      issuesHeader: "Cần kiểm tra",
      strengthsHeader: "Điểm ổn",
      checklistHeader: "Checklist brief",
      noIssues: "Chưa thấy lỗi lớn trong model sơ đồ.",
      noStrengths: "Chưa có điểm mạnh nổi bật.",
      msg: {
        multiZoneGood: "Có nhiều zone chính, dễ đọc công năng.",
        singleZoneBad: "Model chỉ có một module chính; nên tách rõ zone công năng.",
        enoughDetail: "Có đủ chi tiết để ảnh AI bám theo cấu tạo.",
        sparseDetail: "Chi tiết còn ít; nên bổ sung cánh, kệ, ray, tay nắm, khoảng trống kỹ thuật.",
        overflowItems: (n) => `Có ${n} chi tiết vượt khỏi kích thước tổng thể.`,
        boundsOk: "Các chi tiết nằm trong kích thước tổng thể.",
        hasVoid: "Có khai báo khoảng trống/opening kỹ thuật.",
        hasMaterials: "Có vật liệu/màu nền để dẫn prompt ảnh AI.",
        noMaterials: "Thiếu materials; prompt ảnh AI sẽ kém ổn định.",
        unknownCatalog: (ids) => `Có ${ids.length} chi tiết tham chiếu catalogId không tồn tại: ${ids.join(", ")}.`
      }
    },
    export: {
      title: "Xuất dữ liệu cho AI tạo ảnh",
      description: "Tạo ảnh tham chiếu, prompt tiếng Anh/tiếng Việt, hướng dẫn sử dụng và JSON model để đưa vào công cụ AI tạo ảnh.",
      tabExport: "Xuất dữ liệu",
      tabPrompt: "Tạo prompt",
      labelDirection: "Định hướng",
      labelColor: "Màu sắc",
      labelMaterial: "Chất liệu",
      labelRoom: "Bố trí phòng",
      labelLighting: "Ánh sáng",
      labelExtra: "Tùy chọn bổ sung",
      labelPromptEn: "Prompt tiếng Anh - khuyến nghị dùng để tạo ảnh",
      labelPromptVi: "Prompt tiếng Việt - dùng để người dùng kiểm tra",
      btnDownload: "Tải bộ dữ liệu AI",
      btnRefresh: "Tạo lại prompt",
      btnCopy: "Sao chép prompt EN",
      statusInitial: "Chưa xuất file.",
      statusGenerating: "Đang tạo ảnh tham chiếu, prompt và hướng dẫn...",
      statusDone: (n) => `Đã tạo ${n} file.`,
      promptStatus: "Prompt tiếng Anh là bản khuyến nghị để tạo ảnh; bản tiếng Việt dùng để kiểm tra nội dung.",
      copyDone: "Đã sao chép prompt tiếng Anh.",
      placeholderExtra: "Tùy chọn thêm: màu tường, loại sàn, rèm, giường, phong cách phòng...",
      guideTitle: "Cách dùng nhanh",
      guideSteps: [
        "Mở tab Tạo prompt, chọn màu sắc, chất liệu, bố trí phòng và ánh sáng.",
        "Dùng prompt tiếng Anh để tạo ảnh vì thường chính xác và ổn định hơn.",
        "Dùng prompt tiếng Việt để người dùng kiểm tra ý nghĩa trước khi xuất file.",
        "Nhấn Tải bộ dữ liệu AI để lấy ảnh tham chiếu, prompt EN/VI, hướng dẫn và JSON model.",
        "Trong công cụ AI, tải các ảnh reference-*.png lên trước rồi dán prompt tiếng Anh."
      ]
    }
  },
  en: {
    tabs: {
      front: "Front view",
      side: "Side view",
      plan: "Plan view",
      "3d": "3D",
      specs: "Specs"
    },
    headerBadge: {
      width: "Width",
      height: "Height",
      depth: "Depth"
    },
    notes: {
      planView: "Rendered from the same model: modules are main blocks, details are doors/shelves/tracks/handles/accessories.",
      view3d: "Drag to rotate, scroll to zoom, right-drag to pan.",
      view3dHint: "3D shares the same modules and details as the orthographic views — dimensions stay in sync."
    },
    view3d: {
      dimensionsOn: "Show dimensions",
      dimensionsOff: "Hide dimensions",
      paletteLabel: "Palette",
      paletteHint: "Switch palette to preview cabinet in different material tones"
    },
    palette: {
      "wood-oak": { label: "Oak" },
      "wood-walnut": { label: "Walnut" },
      "laminate-white": { label: "Laminate white" },
      "dark-modern": { label: "Dark modern" }
    },
    template: {
      notFound: "Template not found: {id}",
      evalError: "Expression eval error: {message}"
    },
    upload: {
      title: "Analyze a room photo",
      desc: "Upload a room or reference photo and AI converts it into a design model.",
      dropLabel: "Drop an image here, or click to select.",
      hintsLabel: "AI hints (optional)",
      hintsPlaceholder: "Built-in wardrobe, master bedroom, 2.8m × 2.4m, dark walnut wood...",
      btnAnalyze: "Analyze",
      statusResizing: "Resizing image...",
      statusUploading: "Uploading...",
      statusAnalyzing: "AI is analyzing...",
      statusDone: "Done.",
      statusError: "Something went wrong.",
      errNoFile: "No image selected.",
      modelMeta: "AI model",
      cached: "cached",
      labelBefore: "Original",
      labelAfter: "3D render"
    },
    editor: {
      title: "Edit detail",
      empty: "Click a detail on the canvas to edit it.",
      fieldLabel: "Label",
      fieldWidth: "Width",
      fieldHeight: "Height",
      fieldDepth: "Depth",
      fieldColor: "Color",
      fieldMaterial: "Material",
      fieldCatalog: "Catalog",
      materialNone: "(none)",
      catalogNone: "(none)",
      undo: "Undo",
      redo: "Redo",
      deleteSelected: "Delete detail"
    },
    history: {
      title: "History",
      empty: "No changes yet",
      current: "Current",
      preview: "Preview",
      restore: "Restore",
      close: "Close",
      banner: "Viewing past version",
      relative: {
        justNow: "just now",
        minutesAgo: "{n} min ago",
        hoursAgo: "{n} hr ago"
      }
    },
    specs: {
      totalWidth: "Total width",
      totalWidthNote: "Used by front, plan, and 3D views",
      totalHeight: "Total height",
      totalHeightNote: "Used by front and side views",
      totalDepth: "Total cabinet depth",
      totalDepthNote: "Main cabinet body depth",
      moduleCount: "Module count",
      moduleCountNote: "Main blocks of the design",
      detailCount: "Detail count",
      detailCountNote: "Doors, tracks, shelves, handles, accessories, furniture"
    },
    review: {
      title: "Quick review before AI image export",
      subtitle: "A lightweight check for function, geometry, materials, and model detail density.",
      issuesHeader: "Check",
      strengthsHeader: "Working",
      checklistHeader: "Brief checklist",
      noIssues: "No major schematic model issues found.",
      noStrengths: "No standout strengths yet.",
      msg: {
        multiZoneGood: "Multiple main zones make the function easy to read.",
        singleZoneBad: "The model has only one main module; separate functional zones more clearly.",
        enoughDetail: "There are enough details for image generation to follow the construction.",
        sparseDetail: "Details are sparse; add doors, shelves, tracks, handles, and technical openings.",
        overflowItems: (n) => `${n} items exceed the overall model dimensions.`,
        boundsOk: "Items stay inside the overall model dimensions.",
        hasVoid: "Technical voids/openings are declared.",
        hasMaterials: "Material/color data is available for image prompting.",
        noMaterials: "Missing materials; AI image prompts will be less stable.",
        unknownCatalog: (ids) => `${ids.length} items reference unknown catalogId(s): ${ids.join(", ")}.`
      }
    },
    export: {
      title: "Export data for AI image generation",
      description: "Create reference images, English/Vietnamese prompts, a usage guide, and the model JSON for use with external AI image tools.",
      tabExport: "Export data",
      tabPrompt: "Build prompt",
      labelDirection: "Direction",
      labelColor: "Color",
      labelMaterial: "Material",
      labelRoom: "Room layout",
      labelLighting: "Lighting",
      labelExtra: "Extra options",
      labelPromptEn: "English prompt — recommended for image generation",
      labelPromptVi: "Vietnamese prompt — for user review",
      btnDownload: "Download AI bundle",
      btnRefresh: "Rebuild prompt",
      btnCopy: "Copy EN prompt",
      statusInitial: "No files exported yet.",
      statusGenerating: "Generating reference images, prompts and the usage guide...",
      statusDone: (n) => `Generated ${n} files.`,
      promptStatus: "English prompt is recommended for image generation; Vietnamese prompt is for user review.",
      copyDone: "English prompt copied.",
      placeholderExtra: "Extra: wall color, floor type, curtains, bed, room style...",
      guideTitle: "Quick steps",
      guideSteps: [
        "Open the Build prompt tab and pick color, material, room layout, and lighting.",
        "Use the English prompt for image generation — usually more accurate and stable.",
        "Use the Vietnamese prompt for user review before exporting.",
        "Press Download AI bundle to get reference images, EN/VI prompts, the guide and model JSON.",
        "In your AI tool, upload the reference-*.png files first, then paste the English prompt."
      ]
    }
  }
};

export function pickLang(input) {
  return input === "en" ? "en" : "vi";
}

function interpolate(value, vars) {
  if (typeof value !== "string" || !vars) return value;
  return value.replace(/\{([^}]+)\}/g, (match, name) => (
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match
  ));
}

export function t(key, lang, vars) {
  const language = pickLang(lang);
  const parts = key.split(".");
  let cursor = I18N[language];
  for (const part of parts) {
    if (cursor == null) break;
    cursor = cursor[part];
  }
  if (cursor != null) return interpolate(cursor, vars);
  cursor = I18N.en;
  for (const part of parts) {
    if (cursor == null) break;
    cursor = cursor[part];
  }
  return cursor != null ? interpolate(cursor, vars) : key;
}

export function localizeDirection(direction, lang) {
  const language = pickLang(lang);
  return {
    id: direction.id,
    name: language === "vi" ? direction.nameVi : direction.nameEn,
    prompt: language === "vi" ? direction.promptVi : direction.promptEn,
    material: language === "vi" ? direction.materialVi : direction.materialEn
  };
}

export function getDesignDirections(options) {
  const language = pickLang(options && options.language);
  return DESIGN_DIRECTIONS.map((direction) => localizeDirection(direction, language));
}

export function buildIntakeChecklist(options) {
  const language = pickLang(options && options.language);
  return INTAKE_CHECKLIST.map((item) => ({
    id: item.id,
    text: language === "vi" ? item.vi : item.en
  }));
}
