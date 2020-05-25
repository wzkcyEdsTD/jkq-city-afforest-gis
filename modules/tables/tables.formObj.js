/**
 * 表格配置
 */
const COUNTY = [
    { n: '全部', v: '', child: [] },
    {
        n: '鹿城区', v: '鹿城', child: [
            { n: '全部', v: '' },
            { n: '滨江街道', v: '滨江' },
            { n: '大南街道', v: '大南' },
            { n: '丰门街道', v: '丰门' },
            { n: '广化街道', v: '广化' },
            { n: '南汇街道', v: '南汇' },
            { n: '南郊街道', v: '南郊' },
            { n: '蒲鞋市街道', v: '蒲鞋市' },
            { n: '七都街道', v: '七都' },
            { n: '山福镇', v: '山福' },
            { n: '双屿街道', v: '双屿' },
            { n: '松台街道', v: '松台' },
            { n: '腾桥镇', v: '腾桥' },
            { n: '五马街道', v: '五马' },
            { n: '仰义街道', v: '仰义' },
        ]
    },
    {
        n: '龙湾区', v: '龙湾', child: [
            { n: '全部', v: '' },
            { n: '滨海街道', v: '滨海' },
            { n: '海城街道', v: '海城' },
            { n: '蒲州街道', v: '蒲州' },
            { n: '沙城街道', v: '沙城' },
            { n: '天河街道', v: '天河' },
            { n: '星海街道', v: '星海' },
            { n: '瑶溪街道', v: '瑶溪' },
            { n: '永兴街道', v: '永兴' },
            { n: '永中街道', v: '永中' },
            { n: '状元街道', v: '状元' },
        ]
    },
    {
        n: '瓯海区', v: '瓯海', child: [
            { n: '全部', v: '' },
            { n: '茶山街道', v: '茶山' },
            { n: '郭溪街道', v: '郭溪' },
            { n: '景山街道', v: '景山' },
            { n: '丽岙街道', v: '丽岙' },
            { n: '娄桥街道', v: '娄桥' },
            { n: '南白象街道', v: '鹿城南白象'},
            { n: '潘桥街道', v: '潘桥' },
            { n: '瞿溪街道', v: '瞿溪' },
            { n: '三垟街道', v: '三垟' },
            { n: '梧田街道', v: '梧田' },
            { n: '仙岩街道', v: '仙岩' },
            { n: '新桥街道', v: '新桥' },
            { n: '泽雅镇', v: '泽雅' },
        ] },
    {
        n: '洞头区', v: '洞头', child: [
            { n: '全部', v: '' },
            { n: '北岙街道', v: '北岙' },
            { n: '大门镇', v: '大门' },
            { n: '东屏街道', v: '东屏' },
            { n: '灵昆街道', v: '灵昆' },
            { n: '鹿西乡', v: '鹿西' },
            { n: '霓屿街道', v: '霓屿' },
            { n: '元觉街道', v: '元觉' },

        ]
    }
]
// 所属街道
const TOWN = [];
// 绿地更新状态
const UPDATESTATE = [
    { n: '全部', v: '' },
    { n: '维持', v: 'O' },
    { n: '新增', v: 'A' },
];
// 问题分类
const problemType = [
    { n: '全部', v: '' },
    { n: '缺失', v: '缺失' },
    { n: '病害', v: '病害' },
    { n: '分叉', v: '分叉' },
    { n: '畸形', v: '畸形' },
    { n: '枯萎', v: '枯萎' },
    { n: '倾斜', v: '倾斜' },
    { n: '有坑无树', v: '有坑无树' }
];
define("tables/formObj", [], function () {
    const config = {
        // 温州市绿化资源普查面
        2021: {
            h: [],
            s: []
        },
        // 温州市绿地覆盖
        2036: {
            h: [{ n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 温州市绿地现状
        2024: {
            h: [
                { n: '类别名称', t: 'input', k: 'CLASSNAME' },
                { n: '更新状态', t: 'select', v: UPDATESTATE, k: 'UPDATESTATE' },
                { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' },
                { n: '所属街道', t: 'select', v: [], k: 'TOWN' }
            ],
            img: "",
            s: ['COUNTY', 'TOWN', "CLASSNAME"]
        },
        // 公园绿地
        2025: {
            h: [{ n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 生产绿地
        2026: {
            h: [{ n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 防护绿地
        2027: {
            h: [{ n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 其他绿地
        2028: {
            h: [{ n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 附属绿地
        2029: {
            h: [{ n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 居住绿地
        2030: {
            h: [{ n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 单位绿地
        2031: {
            h: [{ n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 道路绿地
        2032: {
            h: [{ n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 分车绿带
        2033: {
            h: [{ n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 行道树调查
        2034: {
            h: [{ n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 古树名木
        2038: {
            h: [{ n: '名称', t: 'input', k: 'NAME' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }, { n: '地址', t: 'input', k: 'ADDRESS' }],
            img: "gsmm",
            s: ['COUNTY', 'TOWN', 'ADDRESS']
        },
        // 古树名木覆盖面
        2039: {
            h: [{ n: '名称', t: 'input', k: 'NAME' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }, { n: '地址', t: 'input', k: 'ADDRESS' }],
            img: "",
            s: ['COUNTY', 'TOWN', 'ADDRESS']
        },
        // 后备古树名木点
        2040: {
            h: [{ n: '名称', t: 'input', k: 'NAME' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }, { n: '地址', t: 'input', k: 'ADDRESS' }],
            img: "",
            s: ['COUNTY', 'TOWN', 'ADDRESS']
        },
        // 居住区面
        2043: {
            h: [{ n: '名称', t: 'input', k: 'NAME' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }, { n: '地址', t: 'input', k: 'ADDRESS' }],
            img: "",
            s: ['COUNTY', 'TOWN', 'ADDRESS']
        },
        // 公共服务单位面
        2044: {
            h: [{ n: '名称', t: 'input', k: 'NAME' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }, { n: '地址', t: 'input', k: 'ADDRESS' }],
            img: "",
            s: ['COUNTY', 'TOWN', 'ADDRESS']
        },
        // 行道树调查路段面
        2045: {
            h: [{ n: '名称', t: 'input', k: 'NAME' }],
            img: "",
            s: ['NAME']
        },
        // 问题行道树
        2053: {
            h: [{ n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }, { n: '问题分类', t: 'select', v: problemType, k: 'TYPE' }],
            img: "wthds",
            s: ['COUNTY', 'TOWN']
        },
        // 人行道、自行车道线
        2046: {
            h: [{ n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },

        // 公园配套设施
        2050: {
            h: [{ n: '名称', t: 'input', k: 'NAME' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }, { n: '所属公园', t: 'input', k: 'LDGS' }],
            img: "gyptss",
            s: ['COUNTY', 'TOWN']
        },
        // 公园范围面
        2051: {
            h: [{ n: '名称', t: 'input', k: 'NAME' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }, { n: '地址', t: 'input', k: 'ADDRESS' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 主要公园绿地精细图斑
        2052: {
            h: [{ n: '所属公园', t: 'input', k: 'LDGS' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "ldjxtb",
            s: ['COUNTY', 'TOWN']
        },
        // 公共服务单位面
        1955: {
            h: [{ n: '名称', t: 'input', k: 'NAME' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }, { n: '地址', t: 'input', k: 'ADDRESS' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 病害
        2106 : {
            h: [{ n: '名称', t: 'input', k: 'MC' }],
            img: "/",
            s: ['MC'],
            nolocate : true
        },
        // 虫害
        2107: {
            h: [{ n: '名称', t: 'input', k: 'MC' }],
            img: "/",
            s: ['MC'],
            nolocate: true
        },
        // 其它生物危害
        2108: {
            h: [{ n: '名称', t: 'input', k: 'MC' }],
            img: "/",
            s: ['MC'],
            nolocate: true
        },
    };
    return config;
})