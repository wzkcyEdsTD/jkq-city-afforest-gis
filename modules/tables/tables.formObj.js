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
// 问题分类
const problemType = [];
define("tables/formObj", [], function () {
    const config = {
        // 古树名木
        1947: {
            h: [{ n: '名称', t: 'input', k: 'NAME' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' },{ n: '所属街道', t: 'select', v: [], k: 'TOWN' }, { n: '地址', t: 'input', k: 'ADDRESS' }],
            img: "gsmm",
            s: ['COUNTY','TOWN']
        },
        // 古树名木覆盖面
        1948: {
            h: [{ n: '名称', t: 'input', k: 'NAME' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' },{ n: '所属街道', t: 'select', v: [], k: 'TOWN' }, { n: '地址', t: 'input', k: 'ADDRESS' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 问题行道树
        1949: {
            h: [{ n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' },{ n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "wthds",
            s: ['COUNTY', 'TOWN']
        },
        // 行道树调查
        1950: {
            h: [{ n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' },{ n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "hds",
            s: ['COUNTY', 'TOWN']
        },
        // 行道树调查路段面
        1951: {
            h: [{ n: '名称', t: 'input', k: 'NAME' }],
            img: "",
            s: ['NAME']
        },
        // 公园配套设施
        1952: {
            h: [{ n: '名称', t: 'input', k: 'NAME' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' },{ n: '所属街道', t: 'select', v: [], k: 'TOWN' }, { n: '所属公园', t: 'input', k: 'LDGS' }],
            img: "gyptss",
            s: ['COUNTY', 'TOWN']
        },
        // 主要公园范围面
        1953: {
            h: [{ n: '名称', t: 'input', k: 'NAME' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' },{ n: '所属街道', t: 'select', v: [], k: 'TOWN' }, { n: '地址', t: 'input', k: 'ADDRESS' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 主要公园绿地精细图斑
        1954: {
            h: [{ n: '所属公园', t: 'input', k: 'LDGS' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' },{ n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "ldjxtb",
            s: ['COUNTY', 'TOWN']
        },
        // 公共服务单位面
        1955: {
            h: [{ n: '名称', t: 'input', k: 'NAME' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' },{ n: '所属街道', t: 'select', v: [], k: 'TOWN' }, { n: '地址', t: 'input', k: 'ADDRESS' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 单位绿地
        1956: {
            h: [{ n: '绿地归属', t: 'input', k: 'LDGS' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' },{ n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 居住区面
        1957: {
            h: [{ n: '名称', t: 'input', k: 'NAME' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' },{ n: '所属街道', t: 'select', v: [], k: 'TOWN' }, { n: '地址', t: 'input', k: 'ADDRESS' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 居住绿地
        1958: {
            h: [{ n: '类别名称', t: 'input', k: 'CLASSNAME' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 人行道与自行车道
        1959: {
            h: [{ n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 道路绿地
        1960: {
            h: [{ n: '类别名称', t: 'input', k: 'CLASSNAME' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 分车绿带
        1961: {
            h: [{ n: '类别名称', t: 'input', k: 'CLASSNAME' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 温州市绿地现状
        1962: {
            h: [{ n: '类别名称', t: 'input', k: 'CLASSNAME' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 温州市绿地覆盖
        1963: {
            h: [{ n: '类别名称', t: 'input', k: 'CLASSNAME' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
        // 温州市绿化资源普查面
        1964: {
            h: [{ n: '类别名称', t: 'input', k: 'CLASSNAME' }, { n: '行政区划', t: 'select', v: COUNTY, k: 'COUNTY' }, { n: '所属街道', t: 'select', v: [], k: 'TOWN' }],
            img: "",
            s: ['COUNTY', 'TOWN']
        },
    };
    return config;
})