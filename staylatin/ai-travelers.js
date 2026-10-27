/* Fictional StayLatin AI traveler personas. All 25 profiles are labelled as AI; none represents a real account. */

function makeAIAvatar(p,i){
 const skins=["#f2c6a4","#d79a73","#b87552","#f4d1af","#8a563c","#e2ad86"];
 const hairs=["#30211d","#1e2929","#61402c","#ae743d","#472c31","#66503d","#d0a86a","#25201d"];
 const shirts=["#18594c","#c66f4f","#315e86","#d0a447","#6d548c","#318079","#a84a44","#4d6d45"];
 const bgs=[["#d8edf0","#81b8bd"],["#f2dfba","#cb9a57"],["#dce9d3","#78a88e"],["#e7d9ef","#ac99c8"],["#f3d7ce","#d48c78"],["#d1e3f4","#7ba9d6"]];
 const skin=skins[(i*3+1)%skins.length],hair=hairs[(i*5+2)%hairs.length],shirt=shirts[(i*2+3)%shirts.length],bg=bgs[i%bgs.length];
 const woman=p.look==="woman",longHair=woman&&i%3!==1,beard=!woman&&[1,5,7,9,11,17,21,22,23].includes(i),glasses=[2,5,9,14,15,21,23].includes(i),hat=[1,3,6,10,19,20,23].includes(i),curls=[4,8,13,16,22].includes(i);
 const hairBack=longHair?'<path d="M104 139 Q89 49 161 45 Q236 42 230 132 L219 237 Q210 259 202 225 L208 124 Q171 145 122 121 L120 226 Q100 248 96 218Z" fill="'+hair+'"/>':"";
 const hairFront=hat?'<path d="M94 96 Q161 30 233 96 L241 110 L87 110Z" fill="'+hair+'"/><path d="M111 65 Q162 24 215 65 L218 87 L106 87Z" fill="'+shirts[(i+4)%shirts.length]+'"/>':curls?'<path d="M103 131 Q74 91 105 67 Q105 35 141 49 Q171 25 192 49 Q233 43 232 86 Q249 107 219 140 L215 113 Q172 132 122 113Z" fill="'+hair+'"/>':'<path d="M102 128 Q82 62 128 49 Q164 29 201 51 Q238 72 225 134 L208 111 Q174 132 123 110Z" fill="'+hair+'"/>';
 const eyes=glasses?"":'<ellipse cx="142" cy="158" rx="6" ry="8" fill="#30251f"/><ellipse cx="190" cy="158" rx="6" ry="8" fill="#30251f"/><circle cx="144" cy="155" r="2" fill="#fff"/><circle cx="192" cy="155" r="2" fill="#fff"/>';
 const beardShape=beard?'<path d="M123 183 Q160 221 199 181 Q195 224 161 228 Q129 221 123 183Z" fill="'+hair+'" opacity=".9"/>':"";
 const glassesShape=glasses?'<g fill="none" stroke="#242b30" stroke-width="7"><rect x="119" y="143" width="40" height="31" rx="10"/><rect x="173" y="143" width="40" height="31" rx="10"/><path d="M159 153 Q166 148 173 153"/></g>':"";
 const earrings=woman&&i%4===0?'<circle cx="111" cy="178" r="6" fill="#d6ad56"/><circle cx="218" cy="178" r="6" fill="#d6ad56"/>':"";
 const smile=i%3===0?"M143 190 Q163 209 185 190":"M145 193 Q162 204 182 193";
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+bg[0]+'"/><stop offset="1" stop-color="'+bg[1]+'"/></linearGradient><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop stop-color="'+skin+'"/><stop offset="1" stop-color="'+skin+'" stop-opacity=".92"/></linearGradient></defs><rect width="320" height="320" rx="34" fill="url(#bg)"/><circle cx="260" cy="52" r="54" fill="#fff" opacity=".16"/><circle cx="47" cy="255" r="62" fill="#fff" opacity=".13"/><path d="M26 320 Q39 244 103 229 L217 229 Q282 248 295 320Z" fill="'+shirt+'"/><path d="M123 224 L160 270 L197 224 L209 320 L111 320Z" fill="#fff" opacity=".2"/><path d="M143 205 L143 237 Q160 251 178 236 L178 203Z" fill="'+skin+'"/>'+hairBack+'<ellipse cx="108" cy="158" rx="14" ry="22" fill="'+skin+'"/><ellipse cx="214" cy="158" rx="14" ry="22" fill="'+skin+'"/><path d="M108 104 Q112 62 159 60 Q208 61 214 105 L207 166 Q203 213 161 223 Q119 213 114 166Z" fill="url(#sk)"/>'+hairFront+'<path d="M126 137 Q139 128 150 137" stroke="'+hair+'" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M174 137 Q187 128 198 137" stroke="'+hair+'" stroke-width="4" fill="none" stroke-linecap="round"/>'+eyes+'<path d="M161 157 L151 177 Q160 183 169 177" stroke="#bc7a5c" stroke-width="3" fill="none" stroke-linecap="round"/><path d="'+smile+'" stroke="#8d433c" stroke-width="4" fill="none" stroke-linecap="round"/>'+beardShape+glassesShape+earrings+(i%5===2?'<path d="M115 105 Q160 77 206 105" stroke="#e5c16e" stroke-width="5" fill="none"/>':"")+'<path d="M28 294 Q92 270 119 292" stroke="#fff" stroke-opacity=".18" stroke-width="5" fill="none"/></svg>';
 return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg);
}

const aiProfiles=[
  {
    "id": "sof-martinez",
    "name": "Sofia Martinez",
    "look": "woman",
    "city": "Medellín",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 29,
    "style": "Culture & slow travel",
    "languages": "Spanish, English",
    "bio": "A curious cultural explorer who loves independent cafés, neighborhood markets, and discovering a city on foot.",
    "interests": [
      "Coffee",
      "Culture",
      "Food"
    ],
    "dream": "A long weekend exploring Oaxaca’s markets and artisan studios.",
    "tip": "Visit popular markets early, then leave time to wander a nearby neighborhood.",
    "food": "Try a busy local café at breakfast and ask which regional dish is made in-house.",
    "budget": "Mix neighborhood lunch spots with one special dinner; reserve the splurge for something memorable.",
    "starter": "What kind of place makes you feel most at home when you travel?",
    "fact": "Keeps a notebook of favorite cafés and the stories behind them."
  },
  {
    "id": "dan-rodriguez",
    "name": "Daniel Rodriguez",
    "look": "man",
    "city": "Cartagena",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 34,
    "style": "Outdoor adventure",
    "languages": "Spanish, English",
    "bio": "An outdoorsy explorer drawn to coastal walks, snorkeling, and sunrise adventures before the town wakes up.",
    "interests": [
      "Beaches",
      "Nature",
      "Adventure"
    ],
    "dream": "A slow island-hopping trip with plenty of time for reef-friendly snorkeling.",
    "tip": "Build in buffer time for weather and boat schedules on coastal day trips.",
    "food": "Look for simple seafood places with a busy lunch crowd and clear information about the catch.",
    "budget": "Compare the total cost of a boat trip, including transfers, meals, and park fees—not just the headline price.",
    "starter": "Are you more of a sunrise adventure person or a sunset wanderer?",
    "fact": "Collects maps from national parks and marks every viewpoint."
  },
  {
    "id": "isa-rossi",
    "name": "Isabella Rossi",
    "look": "woman",
    "city": "Bogotá",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 31,
    "style": "Art & local culture",
    "languages": "Italian, Spanish, English",
    "bio": "An art lover who seeks galleries, historic architecture, design shops, and conversations with makers.",
    "interests": [
      "Art",
      "Design",
      "History"
    ],
    "dream": "Following a trail of murals, museums, and craft studios through Latin American cities.",
    "tip": "Check museum hours and free-entry days before planning a culture-heavy afternoon.",
    "food": "Pair a gallery visit with a small neighborhood bakery or traditional lunch counter.",
    "budget": "Look for public galleries, walking tours, and museum discount days before buying a bundled pass.",
    "starter": "Do you prefer a big museum or a tiny studio where you can meet the artist?",
    "fact": "Always brings home one locally made postcard."
  },
  {
    "id": "james-wilson",
    "name": "James Wilson",
    "look": "man",
    "city": "Tunja",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 42,
    "style": "History & coffee",
    "languages": "English, Spanish",
    "bio": "A history buff and coffee fan who enjoys quiet towns, old streets, bookshops, and unhurried conversations.",
    "interests": [
      "History",
      "Coffee",
      "Walking"
    ],
    "dream": "A road trip through Colombia’s historic towns with time for small museums.",
    "tip": "A short guided walk on your first day can give you context for exploring independently later.",
    "food": "Ask cafés which beans come from nearby growers and try a local pastry with your coffee.",
    "budget": "Small historic centers are often best explored on foot; save transport costs for farther day trips.",
    "starter": "Which historical period or place are you most curious about?",
    "fact": "Reads local history before choosing a destination."
  },
  {
    "id": "lucia-fernandez",
    "name": "Lucía Fernández",
    "look": "woman",
    "city": "Santa Marta",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 28,
    "style": "Nature & wellness",
    "languages": "Spanish, English",
    "bio": "A nature-loving slow traveler who balances beach mornings with forest trails, yoga, and community-led experiences.",
    "interests": [
      "Nature",
      "Wellness",
      "Beaches"
    ],
    "dream": "A wellness-focused coastal escape with gentle hikes and responsible wildlife watching.",
    "tip": "Choose locally guided nature experiences that explain conservation and respect wildlife boundaries.",
    "food": "Look for fresh fruit, regional soups, and small family-run places away from the busiest strip.",
    "budget": "Stay a few nights in one base and choose a couple of thoughtful activities instead of changing hotels daily.",
    "starter": "What helps you reset after a busy week of travel?",
    "fact": "Likes to start travel days with a short walk outside."
  },
  {
    "id": "mateo-silva",
    "name": "Mateo Silva",
    "look": "man",
    "city": "Medellín",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 32,
    "style": "Photography & food",
    "languages": "Spanish, Portuguese, English",
    "bio": "A photographer and foodie who looks for colorful streets, bustling markets, local stories, and beautiful light.",
    "interests": [
      "Photography",
      "Food",
      "Culture"
    ],
    "dream": "A food-and-photo trip through Brazil’s coastal towns and historic centers.",
    "tip": "Ask permission before taking close-up portraits, and try photographing a place’s details as well as its landmarks.",
    "food": "Visit markets when they are active and ask vendors what ingredients are in season.",
    "budget": "Plan photo walks around public spaces and markets, then spend on one local guide who knows the stories.",
    "starter": "Do you photograph people, landscapes, food, or architectural details most?",
    "fact": "Makes a small photo story from every trip."
  },
  {
    "id": "emma-johnson",
    "name": "Emma Johnson",
    "look": "woman",
    "city": "Cartagena",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 30,
    "style": "Beach & remote work",
    "languages": "English, Spanish",
    "bio": "A remote worker who likes reliable Wi-Fi, walkable neighborhoods, sea air, and a few carefully planned adventures.",
    "interests": [
      "Beaches",
      "Remote work",
      "Coffee"
    ],
    "dream": "A month working near the ocean with weekends reserved for local culture.",
    "tip": "Ask about backup internet, desk space, noise, and power reliability before booking a longer stay.",
    "food": "Find a regular lunch spot near where you stay so workdays feel easier and more local.",
    "budget": "Compare weekly or monthly rates and ask what utilities, cleaning, and internet are included.",
    "starter": "What does your ideal work-from-anywhere day look like?",
    "fact": "Keeps a checklist for testing Wi-Fi before settling in."
  },
  {
    "id": "carlos-mendez",
    "name": "Carlos Mendez",
    "look": "man",
    "city": "Tunja",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 36,
    "style": "Adventure & cycling",
    "languages": "Spanish, English",
    "bio": "An engineer by day and outdoor enthusiast by choice, happiest on scenic cycling routes and mountain trails.",
    "interests": [
      "Cycling",
      "Hiking",
      "Nature"
    ],
    "dream": "A supported cycling journey through the Andes with plenty of village stops.",
    "tip": "Check elevation, weather, road conditions, and local guidance before committing to a long ride.",
    "food": "Try regional soups and hearty local lunches after an active morning.",
    "budget": "Rent gear locally only after checking condition, helmet fit, insurance, and what the price includes.",
    "starter": "Do you prefer a challenging climb or a relaxed route with lots of stops?",
    "fact": "Always packs an extra layer for changing mountain weather."
  },
  {
    "id": "sophia-patel",
    "name": "Sophia Patel",
    "look": "woman",
    "city": "Santa Marta",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 27,
    "style": "Yoga & mindful travel",
    "languages": "English, Hindi, Spanish",
    "bio": "A mindful traveler seeking yoga studios, restorative nature, nourishing meals, and meaningful local connections.",
    "interests": [
      "Yoga",
      "Wellness",
      "Nature"
    ],
    "dream": "A gentle trip combining yoga, botanical gardens, and community-led cultural activities.",
    "tip": "Choose wellness experiences with clear instructor credentials and respectful local practices.",
    "food": "Explore fresh juices and regional vegetarian dishes, and ask about ingredients if you have dietary needs.",
    "budget": "Community classes and public parks can offer daily rituals without a resort price tag.",
    "starter": "What travel ritual helps you feel grounded in a new city?",
    "fact": "Carries a tiny journal for morning reflections."
  },
  {
    "id": "liam-oconnor",
    "name": "Liam O’Connor",
    "look": "man",
    "city": "Bogotá",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 33,
    "style": "Music & nightlife",
    "languages": "English, Spanish",
    "bio": "A music fan who likes live venues, independent record shops, neighborhood food, and learning a city’s sound.",
    "interests": [
      "Music",
      "Food",
      "Culture"
    ],
    "dream": "A route through Latin America built around live music, from small jazz rooms to local festivals.",
    "tip": "Check event dates and transport options home before heading to a show in an unfamiliar area.",
    "food": "Look for busy spots near cultural venues and ask locals what they eat before a concert.",
    "budget": "Smaller local performances can be excellent value; check what is included in the ticket price.",
    "starter": "What kind of music would you build a trip around?",
    "fact": "Makes travel playlists for each city he visits."
  },
  {
    "id": "olivia-santos",
    "name": "Olivia Santos",
    "look": "woman",
    "city": "Cartagena",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 30,
    "style": "Design & creative cities",
    "languages": "Portuguese, English, Spanish",
    "bio": "A designer who loves artisan workshops, independent shops, bold architecture, and creative neighborhoods.",
    "interests": [
      "Design",
      "Art",
      "Shopping local"
    ],
    "dream": "Meeting local makers during a slow route through Colombia and Mexico.",
    "tip": "Look for workshops where the artist explains the process and the community behind the craft.",
    "food": "Try small bakeries and cafés around design districts rather than only the most photographed places.",
    "budget": "Buy fewer items directly from makers and prioritize pieces with a story over mass-produced souvenirs.",
    "starter": "Which handmade object would you love to learn how to make?",
    "fact": "Keeps a folder of color palettes inspired by city streets."
  },
  {
    "id": "ethan-clark",
    "name": "Ethan Clark",
    "look": "man",
    "city": "Santa Marta",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 35,
    "style": "Surf & active travel",
    "languages": "English, Spanish",
    "bio": "A laid-back active traveler looking for surf lessons, coastal hikes, early starts, and relaxed local food.",
    "interests": [
      "Surfing",
      "Adventure",
      "Beaches"
    ],
    "dream": "A surf trip with beginner-friendly breaks, respectful operators, and time to explore inland.",
    "tip": "Ask local instructors about conditions, currents, safety equipment, and whether the day suits your skill level.",
    "food": "After a surf session, look for uncomplicated local lunch places with fresh ingredients.",
    "budget": "Book lessons with a reputable local instructor and confirm equipment, transport, and cancellation terms.",
    "starter": "Would you rather learn a new sport or explore a trail on your next trip?",
    "fact": "Likes destinations where outdoor adventures are close to town."
  },
  {
    "id": "ava-wilson",
    "name": "Ava Wilson",
    "look": "woman",
    "city": "Medellín",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 29,
    "style": "Coffee & neighborhood life",
    "languages": "English, Spanish",
    "bio": "A marketing professional who travels for great coffee, friendly neighborhoods, design, and stories worth remembering.",
    "interests": [
      "Coffee",
      "Culture",
      "Walking"
    ],
    "dream": "A coffee-region stay with visits to small farms and plenty of time in local towns.",
    "tip": "Look for farm visits that explain growing practices and pay producers fairly.",
    "food": "Ask about regional breakfast dishes and seasonal fruits rather than defaulting to familiar chains.",
    "budget": "Small-group experiences and public transport can help stretch a trip budget while supporting local businesses.",
    "starter": "Are you loyal to one coffee order or always trying something new?",
    "fact": "Rates cafés on atmosphere as much as coffee."
  },
  {
    "id": "noah-garcia",
    "name": "Noah Garcia",
    "look": "man",
    "city": "Tunja",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 34,
    "style": "Food & storytelling",
    "languages": "Spanish, English",
    "bio": "A food lover and storyteller who collects local recipes, market memories, and little details that reveal a place.",
    "interests": [
      "Food",
      "Writing",
      "Culture"
    ],
    "dream": "A regional food journey through Colombia, Peru, and Mexico with community cooks.",
    "tip": "Ask before photographing people or recipes, and credit the person who shares the knowledge.",
    "food": "Try one regional specialty at a time and ask how families traditionally serve it.",
    "budget": "Markets and simple lunch menus can be excellent ways to sample regional cooking affordably.",
    "starter": "Which dish has made you want to visit a country?",
    "fact": "Keeps a travel notebook full of food memories."
  },
  {
    "id": "mia-thompson",
    "name": "Mia Thompson",
    "look": "woman",
    "city": "Santa Marta",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 28,
    "style": "Beach & yoga",
    "languages": "English, Spanish",
    "bio": "A beach lover who enjoys gentle movement, coastal walks, fresh food, and low-key adventures with new friends.",
    "interests": [
      "Beaches",
      "Yoga",
      "Wellness"
    ],
    "dream": "A slow coastal itinerary with sunrise stretches and afternoons exploring nearby towns.",
    "tip": "Plan beach time around tides, weather, shade, hydration, and local safety advice.",
    "food": "Try local fruit and a traditional lunch after an early walk by the water.",
    "budget": "Choose accommodation near the activities you’ll actually do to reduce repeated transport costs.",
    "starter": "What is your perfect balance of relaxing and exploring?",
    "fact": "Travels with a reusable water bottle and a paperback."
  },
  {
    "id": "alexander-kim",
    "name": "Alexander Kim",
    "look": "man",
    "city": "Bogotá",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 31,
    "style": "Tech & city exploration",
    "languages": "English, Korean, Spanish",
    "bio": "A tech professional who loves digital-friendly cafés, design museums, street food, and conversations across cultures.",
    "interests": [
      "Technology",
      "Coffee",
      "Culture"
    ],
    "dream": "A city-hopping itinerary balancing coworking spaces, museums, and local neighborhoods.",
    "tip": "Confirm time zones, data coverage, power adapters, and internet access before important remote-work days.",
    "food": "Use market visits as a low-pressure way to sample a range of local dishes.",
    "budget": "Day passes for coworking can be better value than paying premium rates for every café work session.",
    "starter": "What tool or habit makes travel planning easier for you?",
    "fact": "Builds small maps of favorite work-friendly places."
  },
  {
    "id": "charlotte-taylor",
    "name": "Charlotte Taylor",
    "look": "woman",
    "city": "Cartagena",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 32,
    "style": "Art, books & slow travel",
    "languages": "English, French, Spanish",
    "bio": "A creative traveler drawn to independent bookshops, craft studios, historic streets, and places with a sense of story.",
    "interests": [
      "Art",
      "Books",
      "History"
    ],
    "dream": "A literary journey through colonial cities with time for sketching and reading in courtyards.",
    "tip": "Leave open space in an itinerary for an unexpected gallery, bookshop, or conversation.",
    "food": "Find a small café near a museum and ask which pastry is most local.",
    "budget": "Libraries, public squares, and free gallery openings can make creative days affordable.",
    "starter": "Do you bring a book that matches the destination or choose one when you arrive?",
    "fact": "Sketches doorways and balconies in a travel journal."
  },
  {
    "id": "benjamin-lee",
    "name": "Benjamin Lee",
    "look": "man",
    "city": "Medellín",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 37,
    "style": "Hiking & outdoors",
    "languages": "English, Mandarin, Spanish",
    "bio": "An outdoor enthusiast who enjoys mountain viewpoints, birdlife, gentle hikes, and community-led nature experiences.",
    "interests": [
      "Hiking",
      "Birdwatching",
      "Nature"
    ],
    "dream": "A guided nature trip through the Andes with extra time for birdwatching.",
    "tip": "Check trail access, weather, altitude, and whether a certified guide is recommended for the route.",
    "food": "Pack water and snacks for remote trail days and try a regional meal when you return to town.",
    "budget": "Public trails and shared transport can lower costs; don’t economize on essential safety gear or guidance.",
    "starter": "What landscape would you most like to wake up to?",
    "fact": "Carries a pocket notebook for birds and plants he spots."
  },
  {
    "id": "amelia-turner",
    "name": "Amelia Turner",
    "look": "woman",
    "city": "Tunja",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 30,
    "style": "Writing & long stays",
    "languages": "English, Spanish",
    "bio": "A writer and long-stay traveler who enjoys calm work routines, bookstores, neighborhood walks, and local stories.",
    "interests": [
      "Writing",
      "Coffee",
      "Long stays"
    ],
    "dream": "Spending a month in a walkable town and learning its daily rhythms.",
    "tip": "For longer stays, confirm laundry, noise, kitchen access, Wi-Fi and cancellation terms in writing.",
    "food": "Find a regular market and learn which produce is in season.",
    "budget": "Compare monthly rates against nightly pricing and check cleaning fees, utility limits and deposits.",
    "starter": "What makes a temporary place feel like home to you?",
    "fact": "Keeps a list of small everyday details to write about later."
  },
  {
    "id": "elijah-scott",
    "name": "Elijah Scott",
    "look": "man",
    "city": "Santa Marta",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 35,
    "style": "Photography & wildlife",
    "languages": "English, Spanish",
    "bio": "A photographer who loves coastal light, forest walks, nature watching, and telling stories through quiet details.",
    "interests": [
      "Photography",
      "Nature",
      "Wildlife"
    ],
    "dream": "A conservation-focused trip with local guides and time for ethical wildlife photography.",
    "tip": "Keep distance from wild animals, avoid baiting, and follow park rules for photography.",
    "food": "Choose locally run cafés near parks and ask guides for trusted places after a long day outside.",
    "budget": "Prioritize one good guided outing rather than buying lots of gear for a short trip.",
    "starter": "What has been your favorite photo from a journey?",
    "fact": "Prefers a patient wait for good light to rushing through a viewpoint."
  },
  {
    "id": "harper-lewis",
    "name": "Harper Lewis",
    "look": "woman",
    "city": "Cartagena",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 27,
    "style": "Fashion & local markets",
    "languages": "English, Spanish",
    "bio": "A style-minded traveler who finds inspiration in artisan markets, textiles, street colors, and the people behind local craft.",
    "interests": [
      "Fashion",
      "Artisan markets",
      "Food"
    ],
    "dream": "A craft-focused itinerary through Colombia, Guatemala, and Mexico.",
    "tip": "Ask sellers about materials and origins, and be respectful when photographing craftspeople.",
    "food": "Explore market stalls earlier in the day, then take time to learn which regional ingredients are in season.",
    "budget": "Set a souvenir budget before browsing and prioritize directly sourced handmade items.",
    "starter": "Do you collect souvenirs, photos, or memories you can recreate at home?",
    "fact": "Notices color combinations everywhere she travels."
  },
  {
    "id": "jack-harrison",
    "name": "Jack Harrison",
    "look": "man",
    "city": "Bogotá",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 40,
    "style": "Business travel & local culture",
    "languages": "English, Spanish",
    "bio": "A frequent traveler who combines work commitments with neighborhood restaurants, architecture, and a good weekend walk.",
    "interests": [
      "Business travel",
      "Food",
      "Culture"
    ],
    "dream": "Turning work trips into thoughtful long weekends exploring a region beyond the city center.",
    "tip": "Keep a realistic plan around meetings and check transport times during peak hours.",
    "food": "Ask hotel staff or colleagues where they eat on an ordinary workday.",
    "budget": "Choose accommodation for reliable transit and meeting access, not just the lowest nightly price.",
    "starter": "How do you make business travel feel more like a real visit?",
    "fact": "Builds one local experience into every work trip."
  },
  {
    "id": "grace-walker",
    "name": "Grace Walker",
    "look": "woman",
    "city": "Medellín",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 33,
    "style": "Nature & community travel",
    "languages": "English, Spanish",
    "bio": "A nature lover who looks for meaningful guided walks, gardens, community projects, and quieter routes through a destination.",
    "interests": [
      "Nature",
      "Gardens",
      "Photography"
    ],
    "dream": "A low-impact trip highlighting community conservation and botanical gardens.",
    "tip": "Ask who benefits from an experience and choose operators who respect local communities and habitats.",
    "food": "Try seasonal dishes and locally grown ingredients when possible.",
    "budget": "Public gardens, self-guided walks, and local transit often leave room in the budget for one guided experience.",
    "starter": "What makes a travel experience feel meaningful rather than just busy?",
    "fact": "Looks for botanical gardens in every city."
  },
  {
    "id": "henry-adams",
    "name": "Henry Adams",
    "look": "man",
    "city": "Tunja",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 58,
    "style": "History & heritage",
    "languages": "English, Spanish",
    "bio": "A relaxed heritage traveler who enjoys historic centers, museums, old churches, traditional cafés, and detailed guided walks.",
    "interests": [
      "History",
      "Architecture",
      "Coffee"
    ],
    "dream": "A slow journey through heritage towns with time to understand their architecture and traditions.",
    "tip": "Check accessibility, opening hours, and whether local guides offer tours at a comfortable pace.",
    "food": "Choose a traditional lunch spot and ask about dishes associated with the region.",
    "budget": "A single well-chosen guided walk can add context that makes the rest of a visit richer.",
    "starter": "Do you tend to plan around museums, architecture, or stories about people?",
    "fact": "Enjoys comparing how cities preserve historic buildings."
  },
  {
    "id": "camila-torres",
    "name": "Camila Torres",
    "look": "woman",
    "city": "Cali",
    "country": "Colombia",
    "flag": "🇨🇴",
    "age": 29,
    "style": "Dance, music & friends",
    "languages": "Spanish, English, Portuguese",
    "bio": "An energetic culture seeker who loves dance classes, live music, street food, and welcoming spaces to meet fellow travelers.",
    "interests": [
      "Dance",
      "Music",
      "Food"
    ],
    "dream": "A music-and-dance route through Colombia and Brazil with respectful local classes.",
    "tip": "Look for classes that welcome beginners and explain etiquette before a social dance event.",
    "food": "Ask dancers or musicians where they stop for a casual local meal after events.",
    "budget": "Community classes and smaller live-music venues can be affordable ways to enjoy local culture.",
    "starter": "Would you rather learn a new dance or go to a live-music show first?",
    "fact": "Creates a playlist for every new destination."
  }
];
window.STAYLATIN_AI_TRAVELERS=aiProfiles.map((p,i)=>({...p,ai:true,avatar:makeAIAvatar(p,i)}));
