/* Supplied template definitions plus explicitly marked reconstructions for six deleted templates. */
App.TemplateLibrary = {
    definitions: [
  {
    "id": "template_1782507999186",
    "name": "Букеты",
    "fields": [
      {
        "id": "image",
        "name": "Изображение",
        "placeholder": "URL картинки",
        "type": "url",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "productType",
        "name": "Тип товара",
        "placeholder": "букет, свеча ароматическая...",
        "type": "text",
        "enabled": true,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      },
      {
        "id": "composition",
        "name": "Состав",
        "placeholder": "розы, лаванда...",
        "type": "text",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "description",
        "name": "Описание",
        "placeholder": "Описание товара...",
        "type": "textarea",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "price",
        "name": "Цена",
        "placeholder": "45",
        "type": "number",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": false
      },
      {
        "id": "label",
        "name": "Этикетка",
        "placeholder": "Текст этикетки...",
        "type": "textarea",
        "enabled": false,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      },
      {
        "id": "note1",
        "name": "Флорист",
        "placeholder": "Дополнительная информация...",
        "type": "text",
        "enabled": true,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      },
      {
        "id": "note2",
        "name": "Примечание 2",
        "placeholder": "Дополнительная информация...",
        "type": "textarea",
        "enabled": false,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      }
    ],
    "contexts": {
      "catalog": {
        "cardTemplate": "[center][width=250][img]{{image}}[/img][/width][/center]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[size=85][color=#A1817E]{{composition}}[/color][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[color=#D6B891]•[/color]\n[size=85][color=#A1817E][b]Флорист:[/b] {{note1}}[/color][/size]\n\n[/center]",
        "optionalFields": {},
        "fullPreview": "[center][width=250][img]https://via.placeholder.com/300x300?text=Фото[/img][/width][/center]\n[center][size=150][b][color=#D6B891]«ПРИМЕР ТОВАРА»[/color][/b][/size]\n[size=85][color=#A1817E][СОСТАВ][/color][/size]\n[color=#D6B891]•[/color]\n[ОПИСАНИЕ]\n[color=#D6B891]•[/color]\n[size=85][color=#A1817E][b]Флорист:[/b] [ПРИМЕЧАНИЕ 1][/color][/size]\n\n[/center]"
      },
      "delivery_hogsmeade": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[size=120][b][color=#8f714a]{{productType}}[/color][/b][/size]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[size=85][color=#A1817E]{{composition}}[/color][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {
          "label": {
            "enabled": false,
            "template": "[center][width=450][more=ЭТИКЕТКА][justify]{{label}}[/justify][/more][/width][/center]"
          },
          "note1": {
            "enabled": false,
            "template": "[color=#D6B891]•[/color] [size=85][color=#A1817E]\n[b]{{note1}}[/b][/color][/size]"
          },
          "note2": {
            "enabled": false,
            "template": "[color=#D6B891]•[/color] [size=85][color=#A1817E]\n{{note2}}[/color][/size]"
          }
        },
        "fullPreview": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для [mention=000]Получатель[/mention] от [mention=000]Отправитель[/mention]\n[more=ЗАПИСКА][i]Текст записки[/i][/more]\n\n[center][width=300][img]https://via.placeholder.com/300x300?text=Фото[/img][/width][/center]\n[size=120][b][color=#8f714a][ТИП ТОВАРА][/color][/b][/size]\n[center][size=150][b][color=#D6B891]«ПРИМЕР ТОВАРА»[/color][/b][/size]\n[size=85][color=#A1817E][СОСТАВ][/color][/size]\n[color=#D6B891]•[/color]\n[ОПИСАНИЕ]\n[/center]\n\n\n[/width][/center]"
      },
      "delivery_hogwarts": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[size=120][b][color=#8f714a]{{productType}}[/color][/b][/size]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[size=85][color=#A1817E]{{composition}}[/color][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {
          "label": {
            "enabled": false,
            "template": "[center][width=450][more=ЭТИКЕТКА][justify]{{label}}[/justify][/more][/width][/center]"
          },
          "note1": {
            "enabled": false,
            "template": "[color=#D6B891]•[/color] [size=85][color=#A1817E]\n[b]{{note1}}[/b][/color][/size]"
          },
          "note2": {
            "enabled": false,
            "template": "[color=#D6B891]•[/color] [size=85][color=#A1817E]\n{{note2}}[/color][/size]"
          }
        },
        "fullPreview": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для [mention=000]Получатель[/mention] от [mention=000]Отправитель[/mention]\n[more=ЗАПИСКА][quote][i]Текст записки[/i][/quote][/more]\n\n[center][width=300][img]https://via.placeholder.com/300x300?text=Фото[/img][/width][/center]\n[size=120][b][color=#8f714a][ТИП ТОВАРА][/color][/b][/size]\n[center][size=150][b][color=#D6B891]«ПРИМЕР ТОВАРА»[/color][/b][/size]\n[size=85][color=#A1817E][СОСТАВ][/color][/size]\n[color=#D6B891]•[/color]\n[ОПИСАНИЕ]\n[/center]\n\n\n[/width][/center]"
      }
    },
    "deliveryTemplates": {
      "hogsmeade": {
        "raven": {
          "header": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        },
        "peach": {
          "header": "[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        }
      },
      "hogwarts": {
        "raven": {
          "header": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        },
        "peach": {
          "header": "[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        }
      }
    }
  },
  {
    "id": "template_1785325918208",
    "name": "Брелоки",
    "fields": [
      {
        "id": "image",
        "name": "Изображение",
        "placeholder": "URL картинки",
        "type": "url",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "productType",
        "name": "Тип товара",
        "placeholder": "букет, свеча ароматическая...",
        "type": "text",
        "enabled": true,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      },
      {
        "id": "composition",
        "name": "Цвет",
        "placeholder": "розы, лаванда...",
        "type": "text",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "description",
        "name": "Описание",
        "placeholder": "Описание товара...",
        "type": "textarea",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "price",
        "name": "Цена",
        "placeholder": "45",
        "type": "number",
        "enabled": false,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": false
      },
      {
        "id": "label",
        "name": "Этикетка",
        "placeholder": "Текст этикетки...",
        "type": "textarea",
        "enabled": true,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      },
      {
        "id": "note1",
        "name": "Примечание 1",
        "placeholder": "Дополнительная информация...",
        "type": "textarea",
        "enabled": false,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      },
      {
        "id": "note2",
        "name": "Примечание 2",
        "placeholder": "Дополнительная информация...",
        "type": "textarea",
        "enabled": false,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      }
    ],
    "contexts": {
      "catalog": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {},
        "fullPreview": "[center][width=300][img]https://via.placeholder.com/300x300?text=Фото[/img][/width][/center]\n[center][size=150][b][color=#D6B891]«ПРИМЕР ТОВАРА»[/color][/b][/size]\n[color=#D6B891]•[/color]\n[ОПИСАНИЕ]\n[/center]"
      },
      "delivery_hogsmeade": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[size=120][b][color=#8f714a]{{productType}}[/color][/b][/size]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[size=85][color=#A1817E]{{composition}}[/color][/size]\n[color=#D6B891]•[/color]\n{{description}}\n\n[more=ЭТИКЕТКА]{{label}}[/more]\n[/center]",
        "optionalFields": {
          "label": {
            "enabled": false,
            "template": "[center][width=450][more=ЭТИКЕТКА][justify]{{label}}[/justify][/more][/width][/center]"
          },
          "note1": {
            "enabled": false,
            "template": "[color=#D6B891]•[/color] [size=85][color=#A1817E]\n[b]{{note1}}[/b][/color][/size]"
          },
          "note2": {
            "enabled": false,
            "template": "[color=#D6B891]•[/color] [size=85][color=#A1817E]\n{{note2}}[/color][/size]"
          }
        },
        "fullPreview": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для [mention=000]Получатель[/mention] от [mention=000]Отправитель[/mention]\n[more=ЗАПИСКА][i]Текст записки[/i][/more]\n\n[center][width=300][img]https://via.placeholder.com/300x300?text=Фото[/img][/width][/center]\n[size=120][b][color=#8f714a][ТИП ТОВАРА][/color][/b][/size]\n[center][size=150][b][color=#D6B891]«ПРИМЕР ТОВАРА»[/color][/b][/size]\n[size=85][color=#A1817E][ЦВЕТ][/color][/size]\n[color=#D6B891]•[/color]\n[ОПИСАНИЕ]\n\n[more=ЭТИКЕТКА][ТЕКСТ ЭТИКЕТКИ][/more]\n[/center]\n\n\n[/width][/center]"
      },
      "delivery_hogwarts": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[size=120][b][color=#8f714a]{{productType}}[/color][/b][/size]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[size=85][color=#A1817E]{{composition}}[/color][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {
          "label": {
            "enabled": false,
            "template": "[center][width=450][more=ЭТИКЕТКА][justify]{{label}}[/justify][/more][/width][/center]"
          },
          "note1": {
            "enabled": false,
            "template": "[color=#D6B891]•[/color] [size=85][color=#A1817E]\n[b]{{note1}}[/b][/color][/size]"
          },
          "note2": {
            "enabled": false,
            "template": "[color=#D6B891]•[/color] [size=85][color=#A1817E]\n{{note2}}[/color][/size]"
          }
        },
        "fullPreview": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для [mention=000]Получатель[/mention] от [mention=000]Отправитель[/mention]\n[more=ЗАПИСКА][quote][i]Текст записки[/i][/quote][/more]\n\n[center][width=300][img]https://via.placeholder.com/300x300?text=Фото[/img][/width][/center]\n[size=120][b][color=#8f714a][ТИП ТОВАРА][/color][/b][/size]\n[center][size=150][b][color=#D6B891]«ПРИМЕР ТОВАРА»[/color][/b][/size]\n[size=85][color=#A1817E][ЦВЕТ][/color][/size]\n[color=#D6B891]•[/color]\n[ОПИСАНИЕ]\n[/center]\n\n\n[/width][/center]"
      }
    },
    "deliveryTemplates": {
      "hogsmeade": {
        "raven": {
          "header": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        },
        "peach": {
          "header": "[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        }
      },
      "hogwarts": {
        "raven": {
          "header": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        },
        "peach": {
          "header": "[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        }
      }
    }
  },
  {
    "id": "template_1786737812914",
    "name": "мед",
    "fields": [
      {
        "id": "image",
        "name": "Изображение",
        "placeholder": "URL картинки",
        "type": "url",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "productType",
        "name": "Тип товара",
        "placeholder": "букет, свеча ароматическая...",
        "type": "text",
        "enabled": true,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      },
      {
        "id": "composition",
        "name": "Состав",
        "placeholder": "розы, лаванда...",
        "type": "text",
        "enabled": false,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "description",
        "name": "Описание",
        "placeholder": "Описание товара...",
        "type": "textarea",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "price",
        "name": "Цена",
        "placeholder": "45",
        "type": "number",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": false
      },
      {
        "id": "label",
        "name": "Этикетка",
        "placeholder": "Текст этикетки...",
        "type": "textarea",
        "enabled": false,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      },
      {
        "id": "note1",
        "name": "Примечание 1",
        "placeholder": "Дополнительная информация...",
        "type": "textarea",
        "enabled": false,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      },
      {
        "id": "note2",
        "name": "Примечание 2",
        "placeholder": "Дополнительная информация...",
        "type": "textarea",
        "enabled": false,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      }
    ],
    "contexts": {
      "catalog": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {},
        "fullPreview": "[center][width=300][img]https://via.placeholder.com/300x300?text=Фото[/img][/width][/center]\n[center][size=150][b][color=#D6B891]«ПРИМЕР ТОВАРА»[/color][/b][/size]\n[color=#D6B891]•[/color]\n[ОПИСАНИЕ]\n[/center]"
      },
      "delivery_hogsmeade": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[size=120][b][color=#8f714a]{{productType}}[/color][/b][/size]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {
          "label": {
            "enabled": false,
            "template": "[center][width=450][more=ЭТИКЕТКА][justify]{{label}}[/justify][/more][/width][/center]"
          },
          "note1": {
            "enabled": false,
            "template": "[color=#D6B891]•[/color] [size=85][color=#A1817E]\n[b]{{note1}}[/b][/color][/size]"
          },
          "note2": {
            "enabled": false,
            "template": "[color=#D6B891]•[/color] [size=85][color=#A1817E]\n{{note2}}[/color][/size]"
          }
        },
        "fullPreview": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для [mention=000]Получатель[/mention] от [mention=000]Отправитель[/mention]\n[more=ЗАПИСКА][i]Текст записки[/i][/more]\n\n[center][width=300][img]https://via.placeholder.com/300x300?text=Фото[/img][/width][/center]\n[size=120][b][color=#8f714a][ТИП ТОВАРА][/color][/b][/size]\n[center][size=150][b][color=#D6B891]«ПРИМЕР ТОВАРА»[/color][/b][/size]\n[color=#D6B891]•[/color]\n[ОПИСАНИЕ]\n[/center]\n\n\n[/width][/center]"
      },
      "delivery_hogwarts": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[size=120][b][color=#8f714a]{{productType}}[/color][/b][/size]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {
          "label": {
            "enabled": false,
            "template": "[center][width=450][more=ЭТИКЕТКА][justify]{{label}}[/justify][/more][/width][/center]"
          },
          "note1": {
            "enabled": false,
            "template": "[color=#D6B891]•[/color] [size=85][color=#A1817E]\n[b]{{note1}}[/b][/color][/size]"
          },
          "note2": {
            "enabled": false,
            "template": "[color=#D6B891]•[/color] [size=85][color=#A1817E]\n{{note2}}[/color][/size]"
          }
        },
        "fullPreview": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для [mention=000]Получатель[/mention] от [mention=000]Отправитель[/mention]\n[more=ЗАПИСКА][quote][i]Текст записки[/i][/quote][/more]\n\n[center][width=300][img]https://via.placeholder.com/300x300?text=Фото[/img][/width][/center]\n[size=120][b][color=#8f714a][ТИП ТОВАРА][/color][/b][/size]\n[center][size=150][b][color=#D6B891]«ПРИМЕР ТОВАРА»[/color][/b][/size]\n[color=#D6B891]•[/color]\n[ОПИСАНИЕ]\n[/center]\n\n\n[/width][/center]"
      }
    },
    "deliveryTemplates": {
      "hogsmeade": {
        "raven": {
          "header": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        },
        "peach": {
          "header": "[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        }
      },
      "hogwarts": {
        "raven": {
          "header": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        },
        "peach": {
          "header": "[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        }
      }
    }
  },
  {
    "id": "template_1787834112588",
    "name": "воздух",
    "fields": [
      {
        "id": "image",
        "name": "Изображение",
        "placeholder": "URL картинки",
        "type": "url",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "productType",
        "name": "Тип товара",
        "placeholder": "букет, свеча ароматическая...",
        "type": "text",
        "enabled": true,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      },
      {
        "id": "composition",
        "name": "Состав",
        "placeholder": "розы, лаванда...",
        "type": "text",
        "enabled": false,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "description",
        "name": "Описание",
        "placeholder": "Описание товара...",
        "type": "textarea",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "price",
        "name": "Цена",
        "placeholder": "45",
        "type": "number",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": false
      },
      {
        "id": "label",
        "name": "Этикетка",
        "placeholder": "Текст этикетки...",
        "type": "textarea",
        "enabled": false,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      },
      {
        "id": "note1",
        "name": "Примечание 1",
        "placeholder": "Дополнительная информация...",
        "type": "textarea",
        "enabled": false,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      },
      {
        "id": "note2",
        "name": "Примечание 2",
        "placeholder": "Дополнительная информация...",
        "type": "textarea",
        "enabled": false,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      }
    ],
    "contexts": {
      "catalog": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {},
        "fullPreview": "[center][width=300][img]https://via.placeholder.com/300x300?text=Фото[/img][/width][/center]\n[center][size=150][b][color=#D6B891]«ПРИМЕР ТОВАРА»[/color][/b][/size]\n[color=#D6B891]•[/color]\n[ОПИСАНИЕ]\n[/center]"
      },
      "delivery_hogsmeade": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[size=120][b][color=#8f714a]{{productType}}[/color][/b][/size]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {
          "label": {
            "enabled": false,
            "template": "[center][width=450][more=ЭТИКЕТКА][justify]{{label}}[/justify][/more][/width][/center]"
          },
          "note1": {
            "enabled": false,
            "template": "[color=#D6B891]•[/color] [size=85][color=#A1817E]\n[b]{{note1}}[/b][/color][/size]"
          },
          "note2": {
            "enabled": false,
            "template": "[color=#D6B891]•[/color] [size=85][color=#A1817E]\n{{note2}}[/color][/size]"
          }
        },
        "fullPreview": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для [mention=000]Получатель[/mention] от [mention=000]Отправитель[/mention]\n[more=ЗАПИСКА][i]Текст записки[/i][/more]\n\n[center][width=300][img]https://via.placeholder.com/300x300?text=Фото[/img][/width][/center]\n[size=120][b][color=#8f714a][ТИП ТОВАРА][/color][/b][/size]\n[center][size=150][b][color=#D6B891]«ПРИМЕР ТОВАРА»[/color][/b][/size]\n[color=#D6B891]•[/color]\n[ОПИСАНИЕ]\n[/center]\n\n\n[/width][/center]"
      },
      "delivery_hogwarts": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[size=120][b][color=#8f714a]{{productType}}[/color][/b][/size]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {
          "label": {
            "enabled": false,
            "template": "[center][width=450][more=ЭТИКЕТКА][justify]{{label}}[/justify][/more][/width][/center]"
          },
          "note1": {
            "enabled": false,
            "template": "[color=#D6B891]•[/color] [size=85][color=#A1817E]\n[b]{{note1}}[/b][/color][/size]"
          },
          "note2": {
            "enabled": false,
            "template": "[color=#D6B891]•[/color] [size=85][color=#A1817E]\n{{note2}}[/color][/size]"
          }
        },
        "fullPreview": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для [mention=000]Получатель[/mention] от [mention=000]Отправитель[/mention]\n[more=ЗАПИСКА][quote][i]Текст записки[/i][/quote][/more]\n\n[center][width=300][img]https://via.placeholder.com/300x300?text=Фото[/img][/width][/center]\n[size=120][b][color=#8f714a][ТИП ТОВАРА][/color][/b][/size]\n[center][size=150][b][color=#D6B891]«ПРИМЕР ТОВАРА»[/color][/b][/size]\n[color=#D6B891]•[/color]\n[ОПИСАНИЕ]\n[/center]\n\n\n[/width][/center]"
      }
    },
    "deliveryTemplates": {
      "hogsmeade": {
        "raven": {
          "header": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        },
        "peach": {
          "header": "[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        }
      },
      "hogwarts": {
        "raven": {
          "header": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        },
        "peach": {
          "header": "[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        }
      }
    }
  },
  {
    "id": "template_1788173914879",
    "name": "общая",
    "fields": [
      {
        "id": "image",
        "name": "Изображение",
        "placeholder": "URL картинки",
        "type": "url",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "productType",
        "name": "Тип товара",
        "placeholder": "букет, свеча ароматическая...",
        "type": "text",
        "enabled": true,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      },
      {
        "id": "composition",
        "name": "Состав",
        "placeholder": "розы, лаванда...",
        "type": "text",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "description",
        "name": "Описание",
        "placeholder": "Описание товара...",
        "type": "textarea",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "price",
        "name": "Цена",
        "placeholder": "45",
        "type": "number",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": false
      },
      {
        "id": "label",
        "name": "Этикетка",
        "placeholder": "Текст этикетки...",
        "type": "textarea",
        "enabled": false,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      },
      {
        "id": "note1",
        "name": "Примечание 1",
        "placeholder": "Дополнительная информация...",
        "type": "textarea",
        "enabled": false,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      },
      {
        "id": "note2",
        "name": "Примечание 2",
        "placeholder": "Дополнительная информация...",
        "type": "textarea",
        "enabled": false,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      }
    ],
    "contexts": {
      "catalog": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[size=85][color=#A1817E]{{composition}}[/color][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {},
        "fullPreview": "[center][width=300][img]https://via.placeholder.com/300x300?text=Фото[/img][/width][/center]\n\n[center][size=150][b][color=#D6B891]«ПРИМЕР ТОВАРА»[/color][/b][/size]\n[size=85][color=#A1817E][СОСТАВ][/color][/size]\n[color=#D6B891]•[/color]\n[ОПИСАНИЕ]\n[/center]"
      },
      "delivery_hogsmeade": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[size=120][b][color=#8f714a]{{productType}}[/color][/b][/size]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[size=85][color=#A1817E]{{composition}}[/color][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {
          "label": {
            "enabled": false,
            "template": "[center][width=450][more=ЭТИКЕТКА][justify]{{label}}[/justify][/more][/width][/center]"
          },
          "note1": {
            "enabled": false,
            "template": "[color=#D6B891]•[/color] [size=85][color=#A1817E]\n[b]{{note1}}[/b][/color][/size]"
          },
          "note2": {
            "enabled": false,
            "template": "[color=#D6B891]•[/color] [size=85][color=#A1817E]\n{{note2}}[/color][/size]"
          }
        },
        "fullPreview": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для [mention=000]Получатель[/mention] от [mention=000]Отправитель[/mention]\n[more=ЗАПИСКА][i]Текст записки[/i][/more]\n\n[center][width=300][img]https://via.placeholder.com/300x300?text=Фото[/img][/width][/center]\n[size=120][b][color=#8f714a][ТИП ТОВАРА][/color][/b][/size]\n[center][size=150][b][color=#D6B891]«ПРИМЕР ТОВАРА»[/color][/b][/size]\n[size=85][color=#A1817E][СОСТАВ][/color][/size]\n[color=#D6B891]•[/color]\n[ОПИСАНИЕ]\n[/center]\n\n\n[/width][/center]"
      },
      "delivery_hogwarts": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[size=120][b][color=#8f714a]{{productType}}[/color][/b][/size]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[size=85][color=#A1817E]{{composition}}[/color][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {
          "label": {
            "enabled": false,
            "template": "[center][width=450][more=ЭТИКЕТКА][justify]{{label}}[/justify][/more][/width][/center]"
          },
          "note1": {
            "enabled": false,
            "template": "[color=#D6B891]•[/color] [size=85][color=#A1817E]\n[b]{{note1}}[/b][/color][/size]"
          },
          "note2": {
            "enabled": false,
            "template": "[color=#D6B891]•[/color] [size=85][color=#A1817E]\n{{note2}}[/color][/size]"
          }
        },
        "fullPreview": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для [mention=000]Получатель[/mention] от [mention=000]Отправитель[/mention]\n[more=ЗАПИСКА][quote][i]Текст записки[/i][/quote][/more]\n\n[center][width=300][img]https://via.placeholder.com/300x300?text=Фото[/img][/width][/center]\n[size=120][b][color=#8f714a][ТИП ТОВАРА][/color][/b][/size]\n[center][size=150][b][color=#D6B891]«ПРИМЕР ТОВАРА»[/color][/b][/size]\n[size=85][color=#A1817E][СОСТАВ][/color][/size]\n[color=#D6B891]•[/color]\n[ОПИСАНИЕ]\n[/center]\n\n\n[/width][/center]"
      }
    },
    "deliveryTemplates": {
      "hogsmeade": {
        "raven": {
          "header": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        },
        "peach": {
          "header": "[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        }
      },
      "hogwarts": {
        "raven": {
          "header": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        },
        "peach": {
          "header": "[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        }
      }
    }
  },
  {
    "id": "tpl_1770152436154_fpg7z",
    "name": "старые карточки · восстановлено",
    "fields": [
      {
        "id": "image",
        "name": "Изображение",
        "placeholder": "URL картинки",
        "type": "url",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "type",
        "name": "тип товара",
        "placeholder": "тип товара",
        "type": "text",
        "enabled": true,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      },
      {
        "id": "composition",
        "name": "Состав",
        "placeholder": "розы, лаванда...",
        "type": "text",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "description",
        "name": "Описание",
        "placeholder": "Описание товара...",
        "type": "textarea",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "price",
        "name": "Цена",
        "placeholder": "45",
        "type": "number",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": false
      },
      {
        "id": "recipient_id",
        "name": "счет получателя",
        "placeholder": "217",
        "type": "text",
        "enabled": true,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": false
      }
    ],
    "contexts": {
      "catalog": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[size=85][color=#A1817E]{{composition}}[/color][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {}
      },
      "delivery_hogsmeade": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[size=120][b][color=#8f714a]{{type}}[/color][/b][/size]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[size=85][color=#A1817E]{{composition}}[/color][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {}
      },
      "delivery_hogwarts": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[size=120][b][color=#8f714a]{{type}}[/color][/b][/size]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[size=85][color=#A1817E]{{composition}}[/color][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {}
      }
    },
    "deliveryTemplates": {
      "hogsmeade": {
        "raven": {
          "header": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        },
        "peach": {
          "header": "[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        }
      },
      "hogwarts": {
        "raven": {
          "header": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        },
        "peach": {
          "header": "[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        }
      }
    },
    "recovery": {
      "source": "provided-general-template",
      "baseTemplateId": "template_1788173914879",
      "reason": "definition absent in supplied template export; fields inferred from original product data"
    }
  },
  {
    "id": "template_1770881109332",
    "name": "карточки с этикеткой · восстановлено",
    "fields": [
      {
        "id": "image",
        "name": "Изображение",
        "placeholder": "URL картинки",
        "type": "url",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "productType",
        "name": "Тип товара",
        "placeholder": "букет, свеча ароматическая...",
        "type": "text",
        "enabled": true,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      },
      {
        "id": "composition",
        "name": "Состав",
        "placeholder": "розы, лаванда...",
        "type": "text",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "description",
        "name": "Описание",
        "placeholder": "Описание товара...",
        "type": "textarea",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "price",
        "name": "Цена",
        "placeholder": "45",
        "type": "number",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": false
      },
      {
        "id": "label",
        "name": "Этикетка",
        "placeholder": "Текст этикетки...",
        "type": "textarea",
        "enabled": true,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      },
      {
        "id": "note1",
        "name": "Примечание 1",
        "placeholder": "Дополнительная информация...",
        "type": "textarea",
        "enabled": true,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      }
    ],
    "contexts": {
      "catalog": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[size=85][color=#A1817E]{{composition}}[/color][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {}
      },
      "delivery_hogsmeade": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[size=120][b][color=#8f714a]{{productType}}[/color][/b][/size]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[size=85][color=#A1817E]{{composition}}[/color][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {
          "label": {
            "enabled": true,
            "template": "[center][width=450][more=ЭТИКЕТКА][justify]{{label}}[/justify][/more][/width][/center]"
          },
          "note1": {
            "enabled": true,
            "template": "[size=85]{{note1}}[/size]"
          }
        }
      },
      "delivery_hogwarts": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[size=120][b][color=#8f714a]{{productType}}[/color][/b][/size]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[size=85][color=#A1817E]{{composition}}[/color][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {
          "label": {
            "enabled": true,
            "template": "[center][width=450][more=ЭТИКЕТКА][justify]{{label}}[/justify][/more][/width][/center]"
          },
          "note1": {
            "enabled": true,
            "template": "[size=85]{{note1}}[/size]"
          }
        }
      }
    },
    "deliveryTemplates": {
      "hogsmeade": {
        "raven": {
          "header": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        },
        "peach": {
          "header": "[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        }
      },
      "hogwarts": {
        "raven": {
          "header": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        },
        "peach": {
          "header": "[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        }
      }
    },
    "recovery": {
      "source": "provided-general-template",
      "baseTemplateId": "template_1788173914879",
      "reason": "definition absent in supplied template export; fields inferred from original product data"
    }
  },
  {
    "id": "template_1771159474542",
    "name": "сиропы и топпинги · восстановлено",
    "fields": [
      {
        "id": "image",
        "name": "Изображение",
        "placeholder": "URL картинки",
        "type": "url",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "productType",
        "name": "Тип товара",
        "placeholder": "букет, свеча ароматическая...",
        "type": "text",
        "enabled": true,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      },
      {
        "id": "composition",
        "name": "Состав",
        "placeholder": "розы, лаванда...",
        "type": "text",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "description",
        "name": "Описание",
        "placeholder": "Описание товара...",
        "type": "textarea",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "price",
        "name": "Цена",
        "placeholder": "45",
        "type": "number",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": false
      },
      {
        "id": "label",
        "name": "Этикетка",
        "placeholder": "Текст этикетки...",
        "type": "textarea",
        "enabled": true,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      }
    ],
    "contexts": {
      "catalog": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[size=85][color=#A1817E]{{composition}}[/color][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {}
      },
      "delivery_hogsmeade": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[size=120][b][color=#8f714a]{{productType}}[/color][/b][/size]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[size=85][color=#A1817E]{{composition}}[/color][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {
          "label": {
            "enabled": true,
            "template": "[center][width=450][more=ЭТИКЕТКА][justify]{{label}}[/justify][/more][/width][/center]"
          }
        }
      },
      "delivery_hogwarts": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[size=120][b][color=#8f714a]{{productType}}[/color][/b][/size]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[size=85][color=#A1817E]{{composition}}[/color][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {
          "label": {
            "enabled": true,
            "template": "[center][width=450][more=ЭТИКЕТКА][justify]{{label}}[/justify][/more][/width][/center]"
          }
        }
      }
    },
    "deliveryTemplates": {
      "hogsmeade": {
        "raven": {
          "header": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        },
        "peach": {
          "header": "[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        }
      },
      "hogwarts": {
        "raven": {
          "header": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        },
        "peach": {
          "header": "[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        }
      }
    },
    "recovery": {
      "source": "provided-general-template",
      "baseTemplateId": "template_1788173914879",
      "reason": "definition absent in supplied template export; fields inferred from original product data"
    }
  },
  {
    "id": "template_1771161011315",
    "name": "ароматические свечи · восстановлено",
    "fields": [
      {
        "id": "image",
        "name": "Изображение",
        "placeholder": "URL картинки",
        "type": "url",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "productType",
        "name": "Тип товара",
        "placeholder": "букет, свеча ароматическая...",
        "type": "text",
        "enabled": true,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      },
      {
        "id": "composition",
        "name": "Состав",
        "placeholder": "розы, лаванда...",
        "type": "text",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "description",
        "name": "Описание",
        "placeholder": "Описание товара...",
        "type": "textarea",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "price",
        "name": "Цена",
        "placeholder": "45",
        "type": "number",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": false
      },
      {
        "id": "label",
        "name": "Этикетка",
        "placeholder": "Текст этикетки...",
        "type": "textarea",
        "enabled": true,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      }
    ],
    "contexts": {
      "catalog": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[size=85][color=#A1817E]{{composition}}[/color][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {}
      },
      "delivery_hogsmeade": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[size=120][b][color=#8f714a]{{productType}}[/color][/b][/size]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[size=85][color=#A1817E]{{composition}}[/color][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {
          "label": {
            "enabled": true,
            "template": "[center][width=450][more=ЭТИКЕТКА][justify]{{label}}[/justify][/more][/width][/center]"
          }
        }
      },
      "delivery_hogwarts": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[size=120][b][color=#8f714a]{{productType}}[/color][/b][/size]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[size=85][color=#A1817E]{{composition}}[/color][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {
          "label": {
            "enabled": true,
            "template": "[center][width=450][more=ЭТИКЕТКА][justify]{{label}}[/justify][/more][/width][/center]"
          }
        }
      }
    },
    "deliveryTemplates": {
      "hogsmeade": {
        "raven": {
          "header": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        },
        "peach": {
          "header": "[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        }
      },
      "hogwarts": {
        "raven": {
          "header": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        },
        "peach": {
          "header": "[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        }
      }
    },
    "recovery": {
      "source": "provided-general-template",
      "baseTemplateId": "template_1788173914879",
      "reason": "definition absent in supplied template export; fields inferred from original product data"
    }
  },
  {
    "id": "template_1775038151410",
    "name": "консервированный воздух · восстановлено",
    "fields": [
      {
        "id": "image",
        "name": "Изображение",
        "placeholder": "URL картинки",
        "type": "url",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "productType",
        "name": "Тип товара",
        "placeholder": "букет, свеча ароматическая...",
        "type": "text",
        "enabled": true,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      },
      {
        "id": "description",
        "name": "Описание",
        "placeholder": "Описание товара...",
        "type": "textarea",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "price",
        "name": "Цена",
        "placeholder": "45",
        "type": "number",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": false
      },
      {
        "id": "label",
        "name": "Этикетка",
        "placeholder": "Текст этикетки...",
        "type": "textarea",
        "enabled": true,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      }
    ],
    "contexts": {
      "catalog": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {}
      },
      "delivery_hogsmeade": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[size=120][b][color=#8f714a]{{productType}}[/color][/b][/size]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {
          "label": {
            "enabled": true,
            "template": "[center][width=450][more=ЭТИКЕТКА][justify]{{label}}[/justify][/more][/width][/center]"
          }
        }
      },
      "delivery_hogwarts": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[size=120][b][color=#8f714a]{{productType}}[/color][/b][/size]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {
          "label": {
            "enabled": true,
            "template": "[center][width=450][more=ЭТИКЕТКА][justify]{{label}}[/justify][/more][/width][/center]"
          }
        }
      }
    },
    "deliveryTemplates": {
      "hogsmeade": {
        "raven": {
          "header": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        },
        "peach": {
          "header": "[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        }
      },
      "hogwarts": {
        "raven": {
          "header": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        },
        "peach": {
          "header": "[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        }
      }
    },
    "recovery": {
      "source": "provided-general-template",
      "baseTemplateId": "template_1788173914879",
      "reason": "definition absent in supplied template export; fields inferred from original product data"
    }
  },
  {
    "id": "template_1775659835074",
    "name": "декоративные свечи · восстановлено",
    "fields": [
      {
        "id": "image",
        "name": "Изображение",
        "placeholder": "URL картинки",
        "type": "url",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "productType",
        "name": "Тип товара",
        "placeholder": "букет, свеча ароматическая...",
        "type": "text",
        "enabled": true,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      },
      {
        "id": "description",
        "name": "Описание",
        "placeholder": "Описание товара...",
        "type": "textarea",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": true
      },
      {
        "id": "price",
        "name": "Цена",
        "placeholder": "45",
        "type": "number",
        "enabled": true,
        "required": false,
        "showInCatalog": true,
        "showInDelivery": false
      },
      {
        "id": "label",
        "name": "Этикетка",
        "placeholder": "Текст этикетки...",
        "type": "textarea",
        "enabled": true,
        "required": false,
        "showInCatalog": false,
        "showInDelivery": true
      }
    ],
    "contexts": {
      "catalog": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {}
      },
      "delivery_hogsmeade": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[size=120][b][color=#8f714a]{{productType}}[/color][/b][/size]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {
          "label": {
            "enabled": true,
            "template": "[center][width=450][more=ЭТИКЕТКА][justify]{{label}}[/justify][/more][/width][/center]"
          }
        }
      },
      "delivery_hogwarts": {
        "cardTemplate": "[center][width=300][img]{{image}}[/img][/width][/center]\n[size=120][b][color=#8f714a]{{productType}}[/color][/b][/size]\n[center][size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]",
        "optionalFields": {
          "label": {
            "enabled": true,
            "template": "[center][width=450][more=ЭТИКЕТКА][justify]{{label}}[/justify][/more][/width][/center]"
          }
        }
      }
    },
    "deliveryTemplates": {
      "hogsmeade": {
        "raven": {
          "header": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        },
        "peach": {
          "header": "[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        }
      },
      "hogwarts": {
        "raven": {
          "header": "[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        },
        "peach": {
          "header": "[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n",
          "note": "[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n",
          "productBlock": "{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}",
          "footer": "\n[/width][/center]"
        }
      }
    },
    "recovery": {
      "source": "provided-general-template",
      "baseTemplateId": "template_1788173914879",
      "reason": "definition absent in supplied template export; fields inferred from original product data"
    }
  }
],
    complete: function (products, existing) {
        var templates = structuredClone(existing || []);
        var known = new Set(templates.map(function (t) { return t.id; }));
        products.forEach(function (p) {
            if (known.has(p.templateId)) return;
            var source = App.TemplateLibrary.definitions.find(function (t) { return t.id === p.templateId; });
            if (source) { templates.push(structuredClone(source)); known.add(source.id); }
        });
        return templates;
    }
};
