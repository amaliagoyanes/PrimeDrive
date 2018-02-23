import {PixelRatio, Platform, Dimensions} from 'react-native';

const dimensions = Dimensions.get('screen');
const width = dimensions.width;
const height = dimensions.height;
let unit = 1;
if (width > 1024) {
	unit = 1;
} else if (width > 992) {
  unit = 0.8;
} else if (width > 768) {
  unit = 0.7;
} else if (width > 414) {
  unit = 0.6;
} else if (width > 375) {
  unit = 0.5;
} else if (width > 320) {
  unit = 0.4;
}
const scale = size => size * (Platform.OS === 'ios' ? 1 : PixelRatio.get() * unit);
const scaleText = size => size * (Platform.OS === 'ios' ? 1 : PixelRatio.getFontScale() * (unit));
export {scale, scaleText};