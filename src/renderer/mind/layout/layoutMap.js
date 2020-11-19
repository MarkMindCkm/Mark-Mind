import MinderLayout from "./MindLayout"
import MinderLayout1 from "./MindLayout1"
import MinderLayout2 from "./MindLayout2"
import MinderLayout3 from "./MindLayout3"
import MinderLayout4 from "./MindLayout4"
import MinderLayout5 from "./MindLayout5"
import FishLayout from "./FishLayout"
import DownLayout from "./DownLayout"
import TreeLayout from "./treeLayout2"
// import TimeLayout from "./timeLayout"
// import FreeLayout from "./FreeLayout"
import MultipleTreeLayout from "./MultipleTreeLayout"
import VerticalLayout from "./VerticalLayout"
import BracketLayout from './BracketLayout'

var layoutMap = {
    'minder': MinderLayout,
    'minder1': MinderLayout1,
    'minder2': MinderLayout2,
    'minder3': MinderLayout3,
    'minder4': MinderLayout4,
    'minder5': MinderLayout5,
    'fish': FishLayout,
    'down': DownLayout,
    'tree': TreeLayout,
    // 'time':TimeLayout,
    // 'free':FreeLayout,
    'multipleTree': MultipleTreeLayout,
    'vertical': VerticalLayout,
    'bracket': BracketLayout
}

export default layoutMap;