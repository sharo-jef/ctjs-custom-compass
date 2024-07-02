import { Setting, SettingsObject } from 'SettingsManager/SettingsManager.js'

const settings = new SettingsObject('CustomCompass', [
  {
    name: 'Main',
    settings: [
      new Setting.Button('                                        &eCustom Compass', '&dALPHA v0.0.1', () => { }),
      new Setting.Button('&b', 'By &asharo_jef', () => { })
    ]
  },
  {
    name: 'Basic',
    settings: [
      new Setting.Button('', 'Basic Customize', () => { }),
      new Setting.Button('                                         &eGeneral', '', () => { }),
      new Setting.Toggle('Enabled', true),
      new Setting.Button('                                       &eBackground', '', () => { }),
      new Setting.Toggle('Background', false),
      new Setting.Button('                                         &ePosition', '', () => { }),
      new Setting.Slider('X', Renderer.screen.getWidth() / 2, 0, Renderer.screen.getWidth(), 0),
      new Setting.Slider('Y', 10, 0, Renderer.screen.getHeight(), 0),
      new Setting.Button('                                           &eSize', '', () => { }),
      new Setting.Slider('Width', 300, 0, 400, 0),
      new Setting.Slider('Height', 20, 0, Renderer.screen.getHeight(), 0),
      new Setting.Button('                                           &eScale', '', () => { }),
      new Setting.Slider('Scale', 1, 1, 4, 0),
      new Setting.Button('                                           &eText', '', () => { }),
      new Setting.Toggle('Number', true),
      new Setting.Toggle('Small Scale', true),
      new Setting.Toggle('Large Scale', true),
      new Setting.Toggle('Heading Number', true),
      new Setting.Toggle('Heading Icon', true)
    ]
  },
  {
    name: 'Advanced',
    settings: [
      new Setting.Button('', 'Advanced Customize', () => { }),
      new Setting.Button('                                         &ePosition', '', () => { }),
      new Setting.Button('Heading Number', '', () => { }),
      new Setting.Slider('X', 0, -200, 200, 0),
      new Setting.Slider('Y', 0, -200, 200, 0),
      new Setting.Button('Heading Icon', '', () => { }),
      new Setting.Slider('X ', 0, -200, 200, 0),
      new Setting.Slider('Y ', 0, -200, 200, 0)
    ]
  },
  {
    name: 'Color',
    settings: [
      new Setting.Button('', 'Color Customize', () => { }),
      new Setting.Button('                                           &eAlpha', '', () => { }),
      new Setting.Slider('Alpha', 120, 0, 255, 0)
    ]
  }
]);

settings.setCommand('cc').setSize(500, 340);
Setting.register(settings);

class Compass {
  static direction = new Text('');
  static headingNumberText = new Text('');
  static headingIconText = new Text('');

  static update() {
    this.enabled = settings.getSetting('Basic', 'Enabled');
    this.background = settings.getSetting('Basic', 'Background');
    this.width = Math.floor(settings.getSetting('Basic', 'Width'));
    this.height = Math.floor(settings.getSetting('Basic', 'Height'));
    this.x = Math.floor(settings.getSetting('Basic', 'X'));
    this.y = Math.floor(settings.getSetting('Basic', 'Y'));
    this.half = this.width / 2;
    this.scale = Math.floor(settings.getSetting('Basic', 'Scale')) * 2;
    this.number = settings.getSetting('Basic', 'Number');
    this.smallScale = settings.getSetting('Basic', 'Small Scale');
    this.largeScale = settings.getSetting('Basic', 'Large Scale');
    this.headingNumber = settings.getSetting('Basic', 'Heading Number');
    this.headingIcon = settings.getSetting('Basic', 'Heading Icon');
    this.fadeWidth = 30;
    this.alpha = Math.floor(settings.getSetting('Color', 'Alpha'));
    this.headingNumberPositionX = Math.floor(settings.getSetting('Advanced', 'X'));
    this.headingNumberPositionY = Math.floor(settings.getSetting('Advanced', 'Y'));
    this.headingIconPositionX = Math.floor(settings.getSetting('Advanced', 'X '));
    this.headingIconPositionY = Math.floor(settings.getSetting('Advanced', 'Y '));
  }
}

const direction = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
let flag = false;
let yaw = 0;
let screenWidth = 0;

register('renderOverlay', () => {
  Compass.update();

  if (!Compass.enabled) {
    return;
  }

  flag = false;
  yaw = Player.getYaw();
  screenWidth = Renderer.screen.getWidth();

  if (Compass.background) {
    Renderer.drawRect(0x50000000, Compass.x - Compass.half, Compass.y, Compass.width, Compass.height);
  }

  for (let i = 0; i < 360; i += 15) {
    let x = Compass.x - (yaw - i + 180) * Compass.scale;

    if (x < 0) {
      x += 360 * Compass.scale;
    } else if (x > screenWidth) {
      x -= 360 * Compass.scale;
    }

    let alpha = Compass.alpha;

    if (x < Compass.x - Compass.half + Compass.fadeWidth) {
      alpha *= Math.max(0, Math.min(1, (x - (Compass.x - Compass.half)) / Compass.fadeWidth));
    } else if (x > Compass.x + Compass.half - Compass.fadeWidth) {
      alpha *= Math.max(0, Math.min(1, ((Compass.x + Compass.half) - x) / Compass.fadeWidth));
    }

    const smallScaleWidth = 1;
    const largeScaleWidth = 2;
    const smallScaleHeight = 5;
    const largeScaleHeight = 7;

    if (i % 45 === 0) {
      let dirAlpha = alpha;

      if (Compass.headingNumber) {
        if (Compass.x - Compass.fadeWidth < x && x < Compass.x + Compass.fadeWidth) {
          let tmp = Math.abs((x - Compass.x) / Compass.fadeWidth)
          dirAlpha *= tmp;
          if (tmp < .25) {
            flag = true;
          }
        }
      }

      let index = Math.floor((i / 45) % 8);
      Compass.direction.setString(direction[index]).setScale(1.1);
      let width = Compass.direction.getMaxWidth();
      Compass.direction.setColor(Renderer.color(255, 255, 255, dirAlpha)).draw(x - width / 2, Compass.y + Compass.height - 12);
    } else {
      if (Compass.number) {
        let dirAlpha = alpha;

        if (Compass.headingNumber) {
          if (Compass.x - Compass.fadeWidth < x && x < Compass.x + Compass.fadeWidth) {
            let tmp = Math.abs((x - Compass.x) / Compass.fadeWidth)
            dirAlpha *= tmp;
          }
        }

        let text = Compass.direction.setString('' + i);
        let width = text.getMaxWidth();
        text.setColor(Renderer.color(255, 255, 255, dirAlpha)).draw(x - width / 2, Compass.y + Compass.height - 12);
      }
    }

    if ((Compass.smallScale && i % 45 !== 0) || (Compass.largeScale && i % 45 === 0)) {
      Renderer.drawRect(
        Renderer.color(255, 255, 255, alpha),
        Math.floor(x - (i % 45 === 0 ? largeScaleWidth : smallScaleWidth) / 2),
        Compass.y,
        i % 45 === 0 ? largeScaleWidth : smallScaleWidth,
        (i % 45 === 0 ? largeScaleHeight : smallScaleHeight) + Compass.height - 20
      );
    } else if ((Compass.smallScale && !Compass.largeScale && i % 45 === 0)) {
      Renderer.drawRect(
        Renderer.color(255, 255, 255, alpha),
        Math.floor(x - (i % 45 === 0 ? largeScaleWidth : smallScaleWidth) / 2),
        Compass.y,
        smallScaleWidth,
        smallScaleHeight + Compass.height - 20
      );
    }
  }

  if (Compass.headingNumber) {
    let index = Math.round((yaw + 180) / 45) % 8;
    let text = Compass.headingNumberText.setString(flag ? direction[index] : Math.floor(180 + yaw)).setScale(1.2);
    let width = text.getMaxWidth();
    text.setColor(Renderer.color(255, 255, 255, Compass.alpha)).draw(Compass.x - width / 2 + Compass.headingNumberPositionX, Compass.y + Compass.height - 12 + Compass.headingNumberPositionY);
  }

  if (Compass.headingIcon) {
    let text = Compass.headingIconText.setString('▼').setScale(1.6);
    let width = text.getMaxWidth();
    text.setColor(Renderer.color(255, 255, 255, Compass.alpha)).draw(Compass.x - width / 2 + Compass.headingIconPositionX, Compass.y - 10 + Compass.headingIconPositionY);
  }
});
