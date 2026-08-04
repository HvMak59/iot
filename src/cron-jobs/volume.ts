
// function horizontalCylinderVolume(radius: number, length: number, fillHeight: number) {
//     const r = radius;
//     const h = fillHeight;

//     if (h <= 0) return 0;   // empty 
//     if (h >= 2 * r) return Math.PI * r * r * length; // completely full

//     const term1 = r * r * Math.acos((r - h) / r);
//     const term2 = (r - h) * Math.sqrt(2 * r * h - h * h);

//     const cylinderArea = term1 - term2;

//     return (cylinderArea * length).toFixed(2);
// }



function horizontalCylinderVolume(radius: number, length: number, fillHeight: number) {
    const r = radius;
    const h = fillHeight / 100;

    // Empty
    if (h <= 0) return 0;

    // Completely full
    if (h >= 2 * r) {
        return (Math.PI * r * r * length).toFixed(2);
    }

    let liquidArea: number;

    if (h <= r) {
        // Less than or exactly half full
        const term1 = r * r * Math.acos((r - h) / r);
        const term2 = (r - h) * Math.sqrt(2 * r * h - h * h);

        liquidArea = term1 - term2;
    }
    else {
        // More than half full (full circle - empty area = filled area)
        const emptyHeight = 2 * r - h;

        const term1 = r * r * Math.acos((r - emptyHeight) / r);

        const term2 = (r - emptyHeight) * Math.sqrt(2 * r * emptyHeight - emptyHeight * emptyHeight);

        const emptyArea = term1 - term2;

        liquidArea = Math.PI * r * r - emptyArea;
    }

    return Number((liquidArea * length).toFixed(2));
}

console.log(horizontalCylinderVolume(1.394, 7.349, 217));
// console.log(horizontalCylinderVolume(1.394, 7.349, 102));
// console.log(horizontalCylinderVolume(1.394, 7.349, 136));
// console.log(horizontalCylinderVolume(1.394, 7.349, 170));
// console.log(horizontalCylinderVolume(1.394, 7.349, 204));

console.log("35", horizontalCylinderVolume(1.394, 7.349, 35));
console.log("36", horizontalCylinderVolume(1.394, 7.349, 36));
console.log("37", horizontalCylinderVolume(1.394, 7.349, 37));
console.log("38", horizontalCylinderVolume(1.394, 7.349, 38));
console.log("39", horizontalCylinderVolume(1.394, 7.349, 39));
console.log("40", horizontalCylinderVolume(1.394, 7.349, 40));
console.log("41", horizontalCylinderVolume(1.394, 7.349, 41));
console.log("42", horizontalCylinderVolume(1.394, 7.349, 42));
console.log("43", horizontalCylinderVolume(1.394, 7.349, 43));
console.log("44", horizontalCylinderVolume(1.394, 7.349, 44));
console.log("45", horizontalCylinderVolume(1.394, 7.349, 45));
console.log("46", horizontalCylinderVolume(1.394, 7.349, 46));
console.log("47", horizontalCylinderVolume(1.394, 7.349, 47));
console.log("48", horizontalCylinderVolume(1.394, 7.349, 48));
console.log("49", horizontalCylinderVolume(1.394, 7.349, 49));
console.log("50", horizontalCylinderVolume(1.394, 7.349, 50));
console.log("51", horizontalCylinderVolume(1.394, 7.349, 51));
console.log("52", horizontalCylinderVolume(1.394, 7.349, 52));
console.log("53", horizontalCylinderVolume(1.394, 7.349, 53));
console.log("54", horizontalCylinderVolume(1.394, 7.349, 54));
console.log("55", horizontalCylinderVolume(1.394, 7.349, 55));
console.log("56", horizontalCylinderVolume(1.394, 7.349, 56));
console.log("57", horizontalCylinderVolume(1.394, 7.349, 57));
console.log("58", horizontalCylinderVolume(1.394, 7.349, 58));
console.log("59", horizontalCylinderVolume(1.394, 7.349, 59));
console.log("60", horizontalCylinderVolume(1.394, 7.349, 60));
console.log("61", horizontalCylinderVolume(1.394, 7.349, 61));
console.log("62", horizontalCylinderVolume(1.394, 7.349, 62));
console.log("63", horizontalCylinderVolume(1.394, 7.349, 63));
console.log("64", horizontalCylinderVolume(1.394, 7.349, 64));
console.log("65", horizontalCylinderVolume(1.394, 7.349, 65));
console.log("66", horizontalCylinderVolume(1.394, 7.349, 66));
console.log("67", horizontalCylinderVolume(1.394, 7.349, 67));
console.log("68", horizontalCylinderVolume(1.394, 7.349, 68));
console.log("69", horizontalCylinderVolume(1.394, 7.349, 69));
console.log("70", horizontalCylinderVolume(1.394, 7.349, 70));
console.log("71", horizontalCylinderVolume(1.394, 7.349, 71));
console.log("72", horizontalCylinderVolume(1.394, 7.349, 72));
console.log("73", horizontalCylinderVolume(1.394, 7.349, 73));
console.log("74", horizontalCylinderVolume(1.394, 7.349, 74));
console.log("75", horizontalCylinderVolume(1.394, 7.349, 75));
console.log("76", horizontalCylinderVolume(1.394, 7.349, 76));
console.log("77", horizontalCylinderVolume(1.394, 7.349, 77));
console.log("78", horizontalCylinderVolume(1.394, 7.349, 78));
console.log("79", horizontalCylinderVolume(1.394, 7.349, 79));
console.log("80", horizontalCylinderVolume(1.394, 7.349, 80));
console.log("81", horizontalCylinderVolume(1.394, 7.349, 81));
console.log("82", horizontalCylinderVolume(1.394, 7.349, 82));
console.log("83", horizontalCylinderVolume(1.394, 7.349, 83));
console.log("84", horizontalCylinderVolume(1.394, 7.349, 84));
console.log("85", horizontalCylinderVolume(1.394, 7.349, 85));
console.log("86", horizontalCylinderVolume(1.394, 7.349, 86));
console.log("87", horizontalCylinderVolume(1.394, 7.349, 87));
console.log("88", horizontalCylinderVolume(1.394, 7.349, 88));
console.log("89", horizontalCylinderVolume(1.394, 7.349, 89));
console.log("90", horizontalCylinderVolume(1.394, 7.349, 90));
console.log("91", horizontalCylinderVolume(1.394, 7.349, 91));
console.log("92", horizontalCylinderVolume(1.394, 7.349, 92));
console.log("93", horizontalCylinderVolume(1.394, 7.349, 93));
console.log("94", horizontalCylinderVolume(1.394, 7.349, 94));
console.log("95", horizontalCylinderVolume(1.394, 7.349, 95));
console.log("96", horizontalCylinderVolume(1.394, 7.349, 96));
console.log("97", horizontalCylinderVolume(1.394, 7.349, 97));
console.log("98", horizontalCylinderVolume(1.394, 7.349, 98));
console.log("99", horizontalCylinderVolume(1.394, 7.349, 99));
console.log("100", horizontalCylinderVolume(1.394, 7.349, 100));
console.log("101", horizontalCylinderVolume(1.394, 7.349, 101));
console.log("102", horizontalCylinderVolume(1.394, 7.349, 102));
console.log("103", horizontalCylinderVolume(1.394, 7.349, 103));
console.log("104", horizontalCylinderVolume(1.394, 7.349, 104));
console.log("105", horizontalCylinderVolume(1.394, 7.349, 105));
console.log("106", horizontalCylinderVolume(1.394, 7.349, 106));
console.log("107", horizontalCylinderVolume(1.394, 7.349, 107));
console.log("108", horizontalCylinderVolume(1.394, 7.349, 108));
console.log("109", horizontalCylinderVolume(1.394, 7.349, 109));
console.log("110", horizontalCylinderVolume(1.394, 7.349, 110));
console.log("111", horizontalCylinderVolume(1.394, 7.349, 111));
console.log("112", horizontalCylinderVolume(1.394, 7.349, 112));
console.log("113", horizontalCylinderVolume(1.394, 7.349, 113));
console.log("114", horizontalCylinderVolume(1.394, 7.349, 114));
console.log("115", horizontalCylinderVolume(1.394, 7.349, 115));
console.log("116", horizontalCylinderVolume(1.394, 7.349, 116));
console.log("117", horizontalCylinderVolume(1.394, 7.349, 117));
console.log("118", horizontalCylinderVolume(1.394, 7.349, 118));
console.log("119", horizontalCylinderVolume(1.394, 7.349, 119));
console.log("120", horizontalCylinderVolume(1.394, 7.349, 120));
console.log("121", horizontalCylinderVolume(1.394, 7.349, 121));
console.log("122", horizontalCylinderVolume(1.394, 7.349, 122));
console.log("123", horizontalCylinderVolume(1.394, 7.349, 123));
console.log("124", horizontalCylinderVolume(1.394, 7.349, 124));
console.log("125", horizontalCylinderVolume(1.394, 7.349, 125));
console.log("126", horizontalCylinderVolume(1.394, 7.349, 126));
console.log("127", horizontalCylinderVolume(1.394, 7.349, 127));
console.log("128", horizontalCylinderVolume(1.394, 7.349, 128));
console.log("129", horizontalCylinderVolume(1.394, 7.349, 129));
console.log("130", horizontalCylinderVolume(1.394, 7.349, 130));
console.log("131", horizontalCylinderVolume(1.394, 7.349, 131));
console.log("132", horizontalCylinderVolume(1.394, 7.349, 132));
console.log("133", horizontalCylinderVolume(1.394, 7.349, 133));
console.log("134", horizontalCylinderVolume(1.394, 7.349, 134));
console.log("135", horizontalCylinderVolume(1.394, 7.349, 135));
console.log("136", horizontalCylinderVolume(1.394, 7.349, 136));
console.log("137", horizontalCylinderVolume(1.394, 7.349, 137));
console.log("138", horizontalCylinderVolume(1.394, 7.349, 138));
console.log("139", horizontalCylinderVolume(1.394, 7.349, 139));
console.log("140", horizontalCylinderVolume(1.394, 7.349, 140));
console.log("141", horizontalCylinderVolume(1.394, 7.349, 141));
console.log("142", horizontalCylinderVolume(1.394, 7.349, 142));
console.log("143", horizontalCylinderVolume(1.394, 7.349, 143));
console.log("144", horizontalCylinderVolume(1.394, 7.349, 144));
console.log("145", horizontalCylinderVolume(1.394, 7.349, 145));
console.log("146", horizontalCylinderVolume(1.394, 7.349, 146));
console.log("147", horizontalCylinderVolume(1.394, 7.349, 147));
console.log("148", horizontalCylinderVolume(1.394, 7.349, 148));
console.log("149", horizontalCylinderVolume(1.394, 7.349, 149));
console.log("150", horizontalCylinderVolume(1.394, 7.349, 150));
console.log("151", horizontalCylinderVolume(1.394, 7.349, 151));
console.log("152", horizontalCylinderVolume(1.394, 7.349, 152));
console.log("153", horizontalCylinderVolume(1.394, 7.349, 153));
console.log("154", horizontalCylinderVolume(1.394, 7.349, 154));
console.log("155", horizontalCylinderVolume(1.394, 7.349, 155));
console.log("156", horizontalCylinderVolume(1.394, 7.349, 156));
console.log("157", horizontalCylinderVolume(1.394, 7.349, 157));
console.log("158", horizontalCylinderVolume(1.394, 7.349, 158));
console.log("159", horizontalCylinderVolume(1.394, 7.349, 159));
console.log("160", horizontalCylinderVolume(1.394, 7.349, 160));
console.log("161", horizontalCylinderVolume(1.394, 7.349, 161));
console.log("162", horizontalCylinderVolume(1.394, 7.349, 162));
console.log("163", horizontalCylinderVolume(1.394, 7.349, 163));
console.log("164", horizontalCylinderVolume(1.394, 7.349, 164));
console.log("165", horizontalCylinderVolume(1.394, 7.349, 165));
console.log("166", horizontalCylinderVolume(1.394, 7.349, 166));
console.log("167", horizontalCylinderVolume(1.394, 7.349, 167));
console.log("168", horizontalCylinderVolume(1.394, 7.349, 168));
console.log("169", horizontalCylinderVolume(1.394, 7.349, 169));
console.log("170", horizontalCylinderVolume(1.394, 7.349, 170));
console.log("171", horizontalCylinderVolume(1.394, 7.349, 171));
console.log("172", horizontalCylinderVolume(1.394, 7.349, 172));
console.log("173", horizontalCylinderVolume(1.394, 7.349, 173));
console.log("174", horizontalCylinderVolume(1.394, 7.349, 174));
console.log("175", horizontalCylinderVolume(1.394, 7.349, 175));
console.log("176", horizontalCylinderVolume(1.394, 7.349, 176));
console.log("177", horizontalCylinderVolume(1.394, 7.349, 177));
console.log("178", horizontalCylinderVolume(1.394, 7.349, 178));
console.log("179", horizontalCylinderVolume(1.394, 7.349, 179));
console.log("180", horizontalCylinderVolume(1.394, 7.349, 180));
console.log("181", horizontalCylinderVolume(1.394, 7.349, 181));
console.log("182", horizontalCylinderVolume(1.394, 7.349, 182));
console.log("183", horizontalCylinderVolume(1.394, 7.349, 183));
console.log("184", horizontalCylinderVolume(1.394, 7.349, 184));
console.log("185", horizontalCylinderVolume(1.394, 7.349, 185));
console.log("186", horizontalCylinderVolume(1.394, 7.349, 186));
console.log("187", horizontalCylinderVolume(1.394, 7.349, 187));
console.log("188", horizontalCylinderVolume(1.394, 7.349, 188));
console.log("189", horizontalCylinderVolume(1.394, 7.349, 189));
console.log("190", horizontalCylinderVolume(1.394, 7.349, 190));
console.log("191", horizontalCylinderVolume(1.394, 7.349, 191));
console.log("192", horizontalCylinderVolume(1.394, 7.349, 192));
console.log("193", horizontalCylinderVolume(1.394, 7.349, 193));
console.log("194", horizontalCylinderVolume(1.394, 7.349, 194));
console.log("195", horizontalCylinderVolume(1.394, 7.349, 195));
console.log("196", horizontalCylinderVolume(1.394, 7.349, 196));
console.log("197", horizontalCylinderVolume(1.394, 7.349, 197));
console.log("198", horizontalCylinderVolume(1.394, 7.349, 198));
console.log("199", horizontalCylinderVolume(1.394, 7.349, 199));
console.log("200", horizontalCylinderVolume(1.394, 7.349, 200));
console.log("201", horizontalCylinderVolume(1.394, 7.349, 201));
console.log("202", horizontalCylinderVolume(1.394, 7.349, 202));
console.log("203", horizontalCylinderVolume(1.394, 7.349, 203));
console.log("204", horizontalCylinderVolume(1.394, 7.349, 204));
console.log("205", horizontalCylinderVolume(1.394, 7.349, 205));
console.log("206", horizontalCylinderVolume(1.394, 7.349, 206));
console.log("207", horizontalCylinderVolume(1.394, 7.349, 207));
console.log("208", horizontalCylinderVolume(1.394, 7.349, 208));
console.log("209", horizontalCylinderVolume(1.394, 7.349, 209));
console.log("210", horizontalCylinderVolume(1.394, 7.349, 210));
console.log("211", horizontalCylinderVolume(1.394, 7.349, 211));
console.log("212", horizontalCylinderVolume(1.394, 7.349, 212));
console.log("213", horizontalCylinderVolume(1.394, 7.349, 213));
console.log("214", horizontalCylinderVolume(1.394, 7.349, 214));
console.log("215", horizontalCylinderVolume(1.394, 7.349, 215));
console.log("216", horizontalCylinderVolume(1.394, 7.349, 216));
console.log("217", horizontalCylinderVolume(1.394, 7.349, 217));
console.log("218", horizontalCylinderVolume(1.394, 7.349, 218));
console.log("219", horizontalCylinderVolume(1.394, 7.349, 219));
console.log("220", horizontalCylinderVolume(1.394, 7.349, 220));
console.log("221", horizontalCylinderVolume(1.394, 7.349, 221));
console.log("222", horizontalCylinderVolume(1.394, 7.349, 222));
console.log("223", horizontalCylinderVolume(1.394, 7.349, 223));
console.log("224", horizontalCylinderVolume(1.394, 7.349, 224));
console.log("225", horizontalCylinderVolume(1.394, 7.349, 225));
console.log("226", horizontalCylinderVolume(1.394, 7.349, 226));
console.log("227", horizontalCylinderVolume(1.394, 7.349, 227));
console.log("228", horizontalCylinderVolume(1.394, 7.349, 228));
console.log("229", horizontalCylinderVolume(1.394, 7.349, 229));
console.log("230", horizontalCylinderVolume(1.394, 7.349, 230));
console.log("231", horizontalCylinderVolume(1.394, 7.349, 231));
console.log("232", horizontalCylinderVolume(1.394, 7.349, 232));
console.log("233", horizontalCylinderVolume(1.394, 7.349, 233));
console.log("234", horizontalCylinderVolume(1.394, 7.349, 234));
console.log("235", horizontalCylinderVolume(1.394, 7.349, 235));
console.log("236", horizontalCylinderVolume(1.394, 7.349, 236));
console.log("237", horizontalCylinderVolume(1.394, 7.349, 237));
console.log("238", horizontalCylinderVolume(1.394, 7.349, 238));
console.log("239", horizontalCylinderVolume(1.394, 7.349, 239));
console.log("240", horizontalCylinderVolume(1.394, 7.349, 240));
console.log("241", horizontalCylinderVolume(1.394, 7.349, 241));
console.log("242", horizontalCylinderVolume(1.394, 7.349, 242));
console.log("243", horizontalCylinderVolume(1.394, 7.349, 243));
console.log("244", horizontalCylinderVolume(1.394, 7.349, 244));
console.log("245", horizontalCylinderVolume(1.394, 7.349, 245));
console.log("246", horizontalCylinderVolume(1.394, 7.349, 246));
console.log("247", horizontalCylinderVolume(1.394, 7.349, 247));
console.log("248", horizontalCylinderVolume(1.394, 7.349, 248));
console.log("249", horizontalCylinderVolume(1.394, 7.349, 249));
console.log("250", horizontalCylinderVolume(1.394, 7.349, 250));
console.log("251", horizontalCylinderVolume(1.394, 7.349, 251));
console.log("252", horizontalCylinderVolume(1.394, 7.349, 252));
console.log("253", horizontalCylinderVolume(1.394, 7.349, 253));
console.log("254", horizontalCylinderVolume(1.394, 7.349, 254));
console.log("255", horizontalCylinderVolume(1.394, 7.349, 255));
console.log("256", horizontalCylinderVolume(1.394, 7.349, 256));
console.log("257", horizontalCylinderVolume(1.394, 7.349, 257));
console.log("258", horizontalCylinderVolume(1.394, 7.349, 258));
console.log("259", horizontalCylinderVolume(1.394, 7.349, 259));
console.log("260", horizontalCylinderVolume(1.394, 7.349, 260));
console.log("261", horizontalCylinderVolume(1.394, 7.349, 261));
console.log("262", horizontalCylinderVolume(1.394, 7.349, 262));
console.log("263", horizontalCylinderVolume(1.394, 7.349, 263));
console.log("264", horizontalCylinderVolume(1.394, 7.349, 264));
console.log("265", horizontalCylinderVolume(1.394, 7.349, 265));

// 35 = 5.59 m3
    
// V = L[R^2 cos^−1(R−h​)/r − (R−h)sqrt(2Rh − h^2)]



// 15.07 - 14.86 = 0.21
// 22.12 - 21.74 = 0.38
// 29.17 - 28.65 = 0.52
// 35.89 - 35.18 = 0.71



