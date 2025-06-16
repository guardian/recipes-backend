import fs from 'fs';
import path from 'path';
import * as process from 'process';

const isTest =
	process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

const svgPath = (fileName: string) =>
	isTest
		? path.join(__dirname, 'svgs', fileName)
		: path.join(__dirname, 'src', 'assets', 'svgs', fileName);

export const svgs = {
	FeastLogo: fs.readFileSync(svgPath('FeastLogo.svg'), 'utf-8'),
	TheGuardianLogo: fs.readFileSync(svgPath('TheGuardianLogo.svg'), 'utf-8'),
	'dairy-free': fs.readFileSync(svgPath('Dairy-free.svg'), 'utf-8'),
	'gluten-free': fs.readFileSync(svgPath('Gluten-free.svg'), 'utf-8'),
	vegan: fs.readFileSync(svgPath('Vegan.svg'), 'utf-8'),
	vegetarian: fs.readFileSync(svgPath('Vegetarian.svg'), 'utf-8'),
	camera: fs.readFileSync(svgPath('camera.svg'), 'utf-8'),
	'feast-book-outlined': fs.readFileSync(
		svgPath('feast-book-outlined.svg'),
		'utf-8',
	),
	'clock-filled': fs.readFileSync(svgPath('clock-filled.svg'), 'utf-8'),
	'knife-and-fork': fs.readFileSync(svgPath('knife-and-fork.svg'), 'utf-8'),
};

//load fonts
const fontPath = (fileName: string) =>
	isTest
		? path.join(__dirname, 'fonts', fileName)
		: path.join(__dirname, 'src', 'assets', 'fonts', fileName);
export const fontsBase64 = {
	GuardianRegularEgyptianFont: fs
		.readFileSync(fontPath('GuardianTextEgyptian-Regular.ttf'))
		.toString('base64'),
	GuardianRegularSansFont: fs
		.readFileSync(fontPath('GuardianTextSans-Regular.ttf'))
		.toString('base64'),
	GuardianHeadlineSemiBoldFont: fs
		.readFileSync(fontPath('GHGuardianHeadline-Semibold.otf'))
		.toString('base64'),
	GuardianSansBoldFont: fs
		.readFileSync(fontPath('GuardianTextSans-Bold.ttf'))
		.toString('base64'),
};
