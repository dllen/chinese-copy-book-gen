#!/usr/bin/env python3
"""
AI Content Generation Script for Chinese Copybook Generator
Fills in missing content for all data files.
"""

import json
import os
import re

DATA_DIR = 'data'

def load_json(filename):
    with open(os.path.join(DATA_DIR, filename), 'r') as f:
        return json.load(f)

def save_json(filename, data):
    with open(os.path.join(DATA_DIR, filename), 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# ===== ENGLISH IPA GENERATION =====
def generate_english_ipa():
    """Generate IPA for all English words using common patterns."""
    ipa_data = load_json('english-ipa.json')
    
    # Comprehensive IPA dictionary for elementary English
    ipa_dict = {
        # Common greetings
        "hello": "/həˈləʊ/", "hi": "/haɪ/", "goodbye": "/ɡʊdˈbaɪ/", "bye": "/baɪ/",
        "morning": "/ˈmɔːnɪŋ/", "afternoon": "/ˌɑːftəˈnuːn/", "evening": "/ˈiːvnɪŋ/", "night": "/naɪt/",
        "sorry": "/ˈsɒri/", "thanks": "/θæŋks/", "please": "/pliːz/", "welcome": "/ˈwelkəm/",
        
        # Common verbs
        "is": "/ɪz/", "am": "/æm/", "are": "/ɑː/", "was": "/wɒz/", "were": "/wɜː/",
        "have": "/hæv/", "has": "/hæz/", "do": "/duː/", "does": "/dʌz/",
        "go": "/ɡəʊ/", "goes": "/ɡəʊz/", "come": "/kʌm/", "comes": "/kʌmz/",
        "like": "/laɪk/", "likes": "/laɪks/", "love": "/lʌv/", "loves": "/lʌvz/",
        "eat": "/iːt/", "eats": "/iːts/", "drink": "/drɪŋk/", "drinks": "/drɪŋks/",
        "play": "/pleɪ/", "plays": "/pleɪz/", "read": "/riːd/", "reads": "/riːdz/",
        "write": "/raɪt/", "writes": "/raɪts/", "run": "/rʌn/", "runs": "/rʌnz/",
        "jump": "/dʒʌmp/", "jumps": "/dʒʌmps/", "swim": "/swɪm/", "swims": "/swɪmz/",
        "sing": "/sɪŋ/", "sings": "/sɪŋz/", "dance": "/dɑːns/", "dances": "/dɑːnsɪz/",
        "draw": "/drɔː/", "draws": "/drɔːz/", "paint": "/peɪnt/", "paints": "/peɪnts/",
        "study": "/ˈstʌdi/", "studies": "/ˈstʌdiːz/", "learn": "/lɜːn/", "learns": "/lɜːnz/",
        "teach": "/tiːtʃ/", "teaches": "/ˈtiːtʃɪz/", "work": "/wɜːk/", "works": "/wɜːks/",
        "help": "/help/", "helps": "/helps/", "give": "/ɡɪv/", "gives": "/ɡɪvz/",
        "take": "/teɪk/", "takes": "/teɪks/", "make": "/meɪk/", "makes": "/meɪks/",
        "get": "/ɡet/", "gets": "/ɡets/", "put": "/pʊt/", "puts": "/pʊts/",
        "look": "/lʊk/", "looks": "/lʊks/", "see": "/siː/", "sees": "/siːz/",
        "hear": "/hɪə/", "hears": "/hɪəz/", "listen": "/ˈɪsn/", "listens": "/ˈɪsnz/",
        "say": "/seɪ/", "says": "/sez/", "speak": "/spiːk/", "speaks": "/spiːks/",
        "talk": "/tɔːk/", "talks": "/tɔːks/", "tell": "/tel/", "tells": "/telz/",
        "ask": "/ɑːsk/", "asks": "/ɑːsks/", "answer": "/ˈɑːnsə/", "answers": "/ˈɑːnsəz/",
        "know": "/nəʊ/", "knows": "/nəʊz/", "think": "/θɪŋk/", "thinks": "/θɪŋks/",
        "want": "/wɒnt/", "wants": "/wɒnts/", "need": "/niːd/", "needs": "/niːdz/",
        "can": "/kæn/", "could": "/kʊd/", "will": "/wɪl/", "would": "/wʊd/",
        "should": "/ʃʊd/", "must": "/mʌst/", "may": "/meɪ/", "might": "/maɪt/",
        
        # Common nouns - people
        "i": "/aɪ/", "you": "/juː/", "he": "/hiː/", "she": "/ʃiː/", "it": "/ɪt/",
        "we": "/wiː/", "they": "/ðeɪ/", "me": "/miː/", "him": "/hɪm/", "her": "/hɜː/",
        "us": "/ʌs/", "them": "/ðem/", "my": "/maɪ/", "your": "/jɔː/",
        "his": "/hɪz/", "its": "/ɪts/", "our": "/ˈaʊə/", "their": "/ðeə/",
        "mine": "/maɪn/", "yours": "/jɔːz/", "hers": "/hɜːz/", "ours": "/ˈaʊəz/", "theirs": "/ðeəz/",
        "myself": "/maɪˈself/", "yourself": "/jɔːˈself/", "himself": "/hɪmˈself/",
        "herself": "/hɜːˈself/", "itself": "/ɪtˈself/", "ourselves": "/ˌaʊəˈselvz/",
        "man": "/mæn/", "woman": "/ˈwʊmən/", "boy": "/bɔɪ/", "girl": "/ɡɜːl/",
        "baby": "/ˈbeɪbi/", "child": "/tʃaɪld/", "children": "/ˈtʃɪldrən/",
        "friend": "/frend/", "friends": "/frendz/", "family": "/ˈfæməli/",
        "father": "/ˈfɑːðə/", "mother": "/ˈmʌðə/", "dad": "/dæd/", "mum": "/mʌm/",
        "brother": "/ˈbrʌðə/", "sister": "/ˈsɪstə/", "grandfather": "/ˈɡrændfɑːðə/",
        "grandmother": "/ˈɡrændmʌðə/", "uncle": "/ˈʌŋkl/", "aunt": "/ɑːnt/",
        "cousin": "/ˈkʌzn/", "teacher": "/ˈtiːtʃə/", "student": "/ˈstjuːdnt/",
        "doctor": "/ˈdɒktə/", "nurse": "/nɜːs/", "driver": "/ˈdraɪvə/",
        "worker": "/ˈwɜːkə/", "farmer": "/ˈfɑːmə/", "cook": "/kʊk/",
        
        # Common nouns - animals
        "dog": "/dɒɡ/", "cat": "/kæt/", "bird": "/bɜːd/", "fish": "/fɪʃ/",
        "duck": "/dʌk/", "chicken": "/ˈtʃɪkɪn/", "pig": "/pɪɡ/", "cow": "/kaʊ/",
        "horse": "/hɔːs/", "sheep": "/ʃiːp/", "rabbit": "/ˈræbɪt/",
        "mouse": "/maʊs/", "monkey": "/ˈmʌŋki/", "elephant": "/ˈelɪfənt/",
        "tiger": "/ˈtaɪɡə/", "lion": "/ˈlaɪən/", "bear": "/beə/", "panda": "/ˈpændə/",
        "snake": "/sneɪk/", "dragon": "/ˈdræɡən/", "fox": "/fɒks/",
        "deer": "/dɪə/", "wolf": "/wʊlf/", "frog": "/frɒɡ/", "butterfly": "/ˈbʌtəflaɪ/",
        "bee": "/biː/", "ant": "/ænt/", "spider": "/ˈspaɪdə/",
        
        # Common nouns - food
        "apple": "/ˈæpl/", "banana": "/bəˈnɑːnə/", "orange": "/ˈɒrɪndʒ/",
        "grape": "/ɡreɪp/", "peach": "/piːtʃ/", "pear": "/peə/",
        "watermelon": "/ˈwɔːtəmelən/", "strawberry": "/ˈstrɔːbəri/",
        "tomato": "/təˈmɑːtəʊ/", "potato": "/pəˈteɪtəʊ/",
        "carrot": "/ˈkærət/", "onion": "/ˈʌnjən/", "cabbage": "/ˈkæbɪdʒ/",
        "rice": "/raɪs/", "bread": "/bred/", "noodle": "/ˈnuːdl/",
        "meat": "/miːt/", "beef": "/biːf/", "pork": "/pɔːk/",
        "egg": "/eɡ/", "milk": "/mɪlk/", "water": "/ˈwɔːtə/",
        "tea": "/tiː/", "coffee": "/ˈkɒfi/", "juice": "/dʒuːs/",
        "cake": "/keɪk/", "candy": "/ˈkændi/", "cookie": "/ˈkʊki/",
        "ice": "/aɪs/", "sugar": "/ˈʃʊɡə/", "salt": "/sɔːlt/",
        
        # Common nouns - school
        "book": "/bʊk/", "pen": "/pen/", "pencil": "/ˈpensl/",
        "eraser": "/ɪˈreɪzə/", "ruler": "/ˈruːlə/", "bag": "/bæɡ/",
        "desk": "/desk/", "chair": "/tʃeə/", "table": "/ˈteɪbl/",
        "classroom": "/ˈklɑːsruːm/", "school": "/skuːl/", "library": "/ˈlaɪbrəri/",
        "homework": "/ˈhəʊmwɜːk/", "lesson": "/ˈlesn/", "test": "/test/",
        "question": "/ˈkwestʃən/", "answer": "/ˈɑːnsə/",
        
        # Common nouns - body
        "head": "/hed/", "face": "/feɪs/", "eye": "/aɪ/", "ear": "/ɪə/",
        "nose": "/nəʊz/", "mouth": "/maʊθ/", "hand": "/hænd/", "foot": "/fʊt/",
        "leg": "/leg/", "arm": "/ɑːm/", "finger": "/ˈfɪŋɡə/", "toe": "/təʊ/",
        "hair": "/heə/", "heart": "/hɑːt/", "body": "/ˈbɒdi/",
        
        # Common nouns - nature
        "sun": "/sʌn/", "moon": "/muːn/", "star": "/stɑː/",
        "sky": "/skaɪ/", "cloud": "/klaʊd/", "rain": "/reɪn/", "snow": "/snəʊ/",
        "wind": "/wɪnd/", "storm": "/stɔːm/", "flower": "/ˈflaʊə/",
        "tree": "/triː/", "grass": "/ɡrɑːs/", "leaf": "/liːf/",
        "mountain": "/ˈmaʊntən/", "river": "/ˈrɪvə/", "lake": "/leɪk/",
        "sea": "/siː/", "ocean": "/ˈəʊʃn/", "island": "/ˈaɪlənd/",
        "forest": "/ˈfɒrɪst/", "field": "/fiːld/", "garden": "/ˈɡɑːdn/",
        
        # Common adjectives
        "good": "/ɡʊd/", "bad": "/bæd/", "big": "/bɪɡ/", "small": "/smɔːl/",
        "tall": "/tɔːl/", "short": "/ʃɔːt/", "long": "/lɒŋ/",
        "young": "/jʌŋ/", "old": "/əʊld/", "new": "/njuː/",
        "hot": "/hɒt/", "cold": "/kəʊld/", "warm": "/wɔːm/", "cool": "/kuːl/",
        "happy": "/ˈhæpi/", "sad": "/sæd/", "angry": "/ˈæŋɡri/",
        "tired": "/ˈtaɪəd/", "hungry": "/ˈhʌŋɡri/", "thirsty": "/ˈɜːsti/",
        "beautiful": "/ˈbjuːtɪfʊl/", "ugly": "/ˈʌɡli/",
        "easy": "/ˈiːzi/", "hard": "/hɑːd/", "fast": "/fɑːst/", "slow": "/sləʊ/",
        "clean": "/kliːn/", "dirty": "/ˈɜːti/",
        "tall": "/tɔːl/", "high": "/haɪ/", "low": "/ləʊ/",
        "rich": "/rɪtʃ/", "poor": "/pɔː/",
        "strong": "/strɒŋ/", "weak": "/wiːk/",
        "right": "/raɪt/", "wrong": "/rɒŋ/",
        "true": "/truː/", "false": "/fɔːls/",
        "full": "/fʊl/", "empty": "/ˈempti/",
        "heavy": "/ˈhevi/", "light": "/laɪt/",
        "thick": "/θɪk/", "thin": "/θɪn/",
        "wide": "/waɪd/", "narrow": "/ˈnærəʊ/",
        "deep": "/diːp/", "shallow": "/ˈʃæləʊ/",
        "loud": "/laʊd/", "quiet": "/ˈkwaɪət/",
        "busy": "/ˈbɪzi/", "free": "/friː/",
        "kind": "/kaɪnd/", "nice": "/naɪs/", "fine": "/faɪn/",
        "great": "/ɡreɪt/", "wonderful": "/ˈwʌndəfʊl/",
        "important": "/ɪmˈpɔːtənt/", "special": "/ˈspeʃl/",
        "different": "/ˈdɪfərənt/", "same": "/seɪm/",
        "favorite": "/ˈfeɪvərɪt/", "popular": "/ˈpɒpjʊlə/",
        
        # Colors
        "red": "/red/", "blue": "/bluː/", "green": "/ɡriːn/",
        "yellow": "/ˈjeləʊ/", "black": "/blæk/", "white": "/waɪt/",
        "orange": "/ˈɒrɪndʒ/", "pink": "/pɪŋk/", "purple": "/ˈpɜːpl/",
        "brown": "/braʊn/", "gray": "/ɡreɪl/", "grey": "/ɡreɪ/",
        
        # Numbers
        "one": "/wʌn/", "two": "/tuː/", "three": "/θriː/",
        "four": "/fɔː/", "five": "/faɪv/", "six": "/sɪks/",
        "seven": "/ˈsevn/", "eight": "/eɪt/", "nine": "/naɪn/", "ten": "/ten/",
        
        # Time
        "today": "/təˈdeɪ/", "tomorrow": "/təˈmɒrəʊ/", "yesterday": "/ˈjestədeɪ/",
        "week": "/wiːk/", "month": "/mʌnθ/", "year": "/jɪə/",
        "hour": "/ˈaʊə/", "minute": "/ˈmɪnɪt/", "second": "/ˈsɛkənd/",
        "time": "/taɪm/", "clock": "/klɒk/", "watch": "/wɒtʃ/",
        
        # Places
        "home": "/həʊm/", "house": "/haʊs/", "room": "/ruːm/",
        "door": "/dɔː/", "window": "/ˈwɪndəʊ/", "wall": "/wɔːl/",
        "floor": "/flɔː/", "roof": "/ruːf/", "kitchen": "/ˈkɪtʃɪn/",
        "bedroom": "/ˈbedruːm/", "bathroom": "/ˈbɑːθruːm/",
        "living": "/ˈlɪvɪŋ/", "dining": "/ˈdaɪnɪŋ/",
        "park": "/pɑːk/", "zoo": "/zuː/", "farm": "/fɑːm/",
        "shop": "/ʃɒp/", "store": "/stɔː/", "market": "/ˈmɑːkɪt/",
        "hospital": "/ˈhɒspɪtl/", "station": "/ˈsteɪʃn/",
        "airport": "/ˈeəpɔːt/", "hotel": "/həʊˈtel/",
        "restaurant": "/ˈrestrɒnt/", "cinema": "/ˈsɪnəmə/",
        "bank": "/bæŋk/", "post": "/pəʊst/", "office": "/ˈɒfɪs/",
        "church": "/tʃɜːʃ/", "temple": "/ˈtempl/",
        
        # Transport
        "car": "/kɑː/", "bus": "/bʌs/", "train": "/treɪn/",
        "plane": "/pleɪn/", "ship": "/ʃɪp/", "boat": "/bəʊt/",
        "bike": "/baɪk/", "bicycle": "/ˈbaɪsɪkl/", "taxi": "/ˈtæksi/",
        "subway": "/ˈsʌbweɪ/", "truck": "/trʌk/",
        
        # Weather
        "weather": "/ˈweðə/", "sunny": "/ˈsʌni/", "rainy": "/ˈreɪni/",
        "cloudy": "/ˈklaʊdi/", "windy": "/ˈwɪndi/", "snowy": "/ˈsnəʊi/",
        "warm": "/wɔːm/", "cool": "/kuːl/",
        
        # Subjects
        "chinese": "/tʃaɪˈniːz/", "english": "/ˈɪŋɡlɪʃ/",
        "math": "/mæθ/", "maths": "/mæθs/", "music": "/ˈmjuːzɪk/",
        "art": "/ɑːt/", "pe": "/piːˈiː/", "science": "/ˈsaɪəns/",
        "history": "/ˈhɪstəri/", "geography": "/dʒiˈɒɡrəfi/",
    }
    
    # Phonetic approximations
    phonetic_map = {
        "hello": "赫楼", "good": "古德", "book": "布克", "pen": "彭",
        "dog": "多格", "cat": "凯特", "apple": "阿普尔", "name": "内姆",
        "red": "雷德", "blue": "布鲁", "green": "格林", "yellow": "耶洛",
        "one": "万", "two": "图", "three": "斯里", "four": "福尔",
        "five": "法夫", "six": "西克斯", "seven": "塞文", "eight": "埃特",
        "nine": "奈恩", "ten": "滕",
    }
    
    count = 0
    for word, data in ipa_data.items():
        if not data.get('ipa') and word.lower() in ipa_dict:
            ipa_data[word] = {
                "ipa": ipa_dict[word.lower()],
                "phonetic": phonetic_map.get(word.lower(), "")
            }
            count += 1
    
    save_json('english-ipa.json', ipa_data)
    print(f'English IPA: filled {count} new entries')
    return count

if __name__ == '__main__':
    generate_english_ipa()
