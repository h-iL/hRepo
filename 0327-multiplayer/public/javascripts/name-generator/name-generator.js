export function getRandomName() {

    let a = getRandomItem(colorNames)
    let b = getRandomItem(animalNames)
    let str = a + b 

    return str

}


function getRandomItem(list) {

    return list[Math.floor((Math.random() * list.length))];

}


var animalNames = ["Canidae", "Felidae", "Cat", "Cattle", "Dog", "Donkey", "Goat", "Horse", "Pig", "Rabbit", "Aardvark", "Aardwolf", "Albatross", "Alligator", "Alpaca", "Amphibian", "Anaconda", "Angelfish", "Anglerfish", "Ant", "Anteater", "Antelope", "Antlion", "Ape", "Aphid", "Armadillo", "Asp", "Baboon", "Badger", "Bandicoot", "Barnacle", "Barracuda", "Basilisk", "Bass", "Bat", "Bear", "Beaver", "Bedbug", "Bee", "Beetle", "Bird", "Bison", "Blackbird", "Boa", "Boar", "Bobcat", "Bobolink", "Bonobo", "Booby", "Bovid", "Bug", "Butterfly", "Buzzard", "Camel", "Canid", "Capybara", "Cardinal", "Caribou", "Carp", "Cat", "Catshark", "Caterpillar", "Catfish", "Cattle", "Centipede", "Cephalopod", "Chameleon", "Cheetah", "Chickadee", "Chicken", "Chimpanzee", "Chinchilla", "Chipmunk", "Clam", "Clownfish", "Cobra", "Cockroach", "Cod", "Condor", "Constrictor", "Coral", "Cougar", "Cow", "Coyote", "Crab", "Crane", "Crawdad", "Crayfish", "Cricket", "Crocodile", "Crow", "Cuckoo", "Cicada", "Damselfly", "Deer", "Dingo", "Dinosaur", "Dog", "Dolphin", "Donkey", "Dormouse", "Dove", "Dragonfly", "Dragon", "Duck", "Eagle", "Earthworm", "Earwig", "Echidna", "Eel", "Egret", "Elephant", "Elk", "Emu", "Ermine", "Falcon", "Ferret", "Finch", "Firefly", "Fish", "Flamingo", "Flea", "Fly", "Flyingfish", "Fowl", "Fox", "Frog", "Gamefowl", "Galliform", "Gazelle", "Gecko", "Gerbil", "Gibbon", "Giraffe", "Goat", "Goldfish", "Goose", "Gopher", "Gorilla", "Grasshopper", "Grouse", "Guan", "Guanaco", "Guineafowl", "Gull", "Guppy", "Haddock", "Halibut", "Hamster", "Hare", "Harrier", "Hawk", "Hedgehog", "Heron", "Herring", "Hippopotamus", "Hookworm", "Hornet", "Horse", "Hoverfly", "Hummingbird", "Hyena", "Iguana", "Impala", "Jackal", "Jaguar", "Jay", "Jellyfish", "Junglefowl", "Kangaroo", "Kingfisher", "Kite", "Kiwi", "Koala", "Koi", "Krill", "Ladybug", "Lamprey", "Landfowl", "Lark", "Leech", "Lemming", "Lemur", "Leopard", "Leopon", "Limpet", "Lion", "Lizard", "Llama", "Lobster", "Locust", "Loon", "Louse", "Lungfish", "Lynx", "Macaw", "Mackerel", "Magpie", "Mammal", "Manatee", "Mandrill", "Marlin", "Marmoset", "Marmot", "Marsupial", "Marten", "Mastodon", "Meadowlark", "Meerkat", "Mink", "Minnow", "Mite", "Mockingbird", "Mole", "Mollusk", "Mongoose", "Monkey", "Moose", "Mosquito", "Moth", "Mouse", "Mule", "Muskox", "Narwhal", "Newt", "Nightingale", "Ocelot", "Octopus", "Opossum", "Orangutan", "Orca", "Ostrich", "Otter", "Owl", "Ox", "Panda", "Panther", "Parakeet", "Parrot", "Parrotfish", "Partridge", "Peacock", "Peafowl", "Pelican", "Penguin", "Perch", "Pheasant", "Pig", "Pigeon", "Pike", "Pinniped", "Piranha", "Planarian", "Platypus", "Pony", "Porcupine", "Porpoise", "Possum", "Prawn", "Primate", "Ptarmigan", "Puffin", "Puma", "Python", "Quail", "Quelea", "Quokka", "Rabbit", "Raccoon", "Rat", "Rattlesnake", "Raven", "Reindeer", "Reptile", "Rhinoceros", "Roadrunner", "Rodent", "Rook", "Rooster", "Roundworm", "Sailfish", "Salamander", "Salmon", "Sawfish", "Scallop", "Scorpion", "Seahorse", "Shark", "Sheep", "Shrew", "Shrimp", "Silkworm", "Silverfish", "Skink", "Skunk", "Sloth", "Slug", "Smelt", "Snail", "Snake", "Snipe", "Sole", "Sparrow", "Spider", "Spoonbill", "Squid", "Squirrel", "Starfish", "Stingray", "Stoat", "Stork", "Sturgeon", "Swallow", "Swan", "Swift", "Swordfish", "Swordtail", "Tahr", "Takin", "Tapir", "Tarantula", "Tarsier", "Termite", "Tern", "Thrush", "Tick", "Tiger", "Tiglon", "Toad", "Tortoise", "Toucan", "Trout", "Tuna", "Turkey", "Turtle", "Tyrannosaurus", "Urial", "Vicuna", "Viper", "Vole", "Vulture", "Wallaby", "Walrus", "Wasp", "Warbler", "Weasel", "Whale", "Whippet", "Whitefish", "Wildcat", "Wildebeest", "Wildfowl", "Wolf", "Wolverine", "Wombat", "Woodpecker", "Worm", "Wren", "Xerinae", "Yak", "Zebra", "Alpaca", "Cat", "Cattle", "Chicken", "Dog", "Donkey", "Ferret", "Gayal", "Goldfish", "Guppy", "Horse", "Koi", "Llama", "Sheep", "Yak"];

var colorNames = [
    "AliceBlue",
    "AntiqueWhite",
    "Aqua",
    "Aquamarine",
    "Azure",
    "Beige",
    "Bisque",
    "Black",
    "BlanchedAlmond",
    "Blue",
    "BlueViolet",
    "Brown",
    "BurlyWood",
    "CadetBlue",
    "Chartreuse",
    "Chocolate",
    "Coral",
    "CornflowerBlue",
    "Cornsilk",
    "Crimson",
    "Cyan",
    "DarkBlue",
    "DarkCyan",
    "DarkGoldenRod",
    "DarkGray",
    "DarkGrey",
    "DarkGreen",
    "DarkKhaki",
    "DarkMagenta",
    "DarkOliveGreen",
    "DarkOrange",
    "DarkOrchid",
    "DarkRed",
    "DarkSalmon",
    "DarkSeaGreen",
    "DarkSlateBlue",
    "DarkSlateGray",
    "DarkSlateGrey",
    "DarkTurquoise",
    "DarkViolet",
    "DeepPink",
    "DeepSkyBlue",
    "DimGray",
    "DimGrey",
    "DodgerBlue",
    "FireBrick",
    "FloralWhite",
    "ForestGreen",
    "Fuchsia",
    "Gainsboro",
    "GhostWhite",
    "Gold",
    "GoldenRod",
    "Gray",
    "Grey",
    "Green",
    "GreenYellow",
    "HoneyDew",
    "HotPink",
    "IndianRed",
    "Indigo",
    "Ivory",
    "Khaki",
    "Lavender",
    "LavenderBlush",
    "LawnGreen",
    "LemonChiffon",
    "LightBlue",
    "LightCoral",
    "LightCyan",
    "LightGoldenRodYellow",
    "LightGray",
    "LightGrey",
    "LightGreen",
    "LightPink",
    "LightSalmon",
    "LightSeaGreen",
    "LightSkyBlue",
    "LightSlateGray",
    "LightSlateGrey",
    "LightSteelBlue",
    "LightYellow",
    "Lime",
    "LimeGreen",
    "Linen",
    "Magenta",
    "Maroon",
    "MediumAquaMarine",
    "MediumBlue",
    "MediumOrchid",
    "MediumPurple",
    "MediumSeaGreen",
    "MediumSlateBlue",
    "MediumSpringGreen",
    "MediumTurquoise",
    "MediumVioletRed",
    "MidnightBlue",
    "MintCream",
    "MistyRose",
    "Moccasin",
    "NavajoWhite",
    "Navy",
    "OldLace",
    "Olive",
    "OliveDrab",
    "Orange",
    "OrangeRed",
    "Orchid",
    "PaleGoldenRod",
    "PaleGreen",
    "PaleTurquoise",
    "PaleVioletRed",
    "PapayaWhip",
    "PeachPuff",
    "Peru",
    "Pink",
    "Plum",
    "PowderBlue",
    "Purple",
    "RebeccaPurple",
    "Red",
    "RosyBrown",
    "RoyalBlue",
    "SaddleBrown",
    "Salmon",
    "SandyBrown",
    "SeaGreen",
    "SeaShell",
    "Sienna",
    "Silver",
    "SkyBlue",
    "SlateBlue",
    "SlateGray",
    "SlateGrey",
    "Snow",
    "SpringGreen",
    "SteelBlue",
    "Tan",
    "Teal",
    "Thistle",
    "Tomato",
    "Turquoise",
    "Violet",
    "Wheat",
    "White",
    "WhiteSmoke",
    "Yellow",
    "YellowGreen",
];