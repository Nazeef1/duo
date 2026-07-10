import json
import datetime
from backend.db import SessionLocal, engine, Base
from backend import models

def seed_db():
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Seeding database...")

        # 1. Create Course
        spanish = models.Course(name="Spanish", language_code="es")
        db.add(spanish)
        db.commit()
        db.refresh(spanish)

        # 2. Create Units
        unit1 = models.Unit(course_id=spanish.id, title="Basics & Greetings", order_index=0)
        unit2 = models.Unit(course_id=spanish.id, title="Travel & Food", order_index=1)
        db.add(unit1)
        db.add(unit2)
        db.commit()
        db.refresh(unit1)
        db.refresh(unit2)

        # 3. Create Skills
        # Unit 1 Skills
        greetings = models.Skill(unit_id=unit1.id, title="Greetings", icon="wave", order_index=0)
        intro = models.Skill(unit_id=unit1.id, title="Introduction", icon="chat", order_index=1)
        # Unit 2 Skills
        cafe = models.Skill(unit_id=unit2.id, title="Café", icon="coffee", order_index=0)
        hotel = models.Skill(unit_id=unit2.id, title="Hotel", icon="hotel", order_index=1)
        airport = models.Skill(unit_id=unit2.id, title="Airport", icon="airport", order_index=2)
        
        db.add_all([greetings, intro, cafe, hotel, airport])
        db.commit()
        db.refresh(greetings)
        db.refresh(intro)
        db.refresh(cafe)
        db.refresh(hotel)
        db.refresh(airport)

        # Helper function to add exercises
        def create_greetings_exercises(lesson_id, is_lesson_two=False):
            if not is_lesson_two:
                return [
                    models.Exercise(
                        lesson_id=lesson_id,
                        order_index=0,
                        type="multiple_choice",
                        data_json=json.dumps({
                            "prompt": "Choose the correct translation of 'Hello'",
                            "options": ["hola", "adiós", "gracias", "por favor"],
                            "answer": "hola"
                        })
                    ),
                    models.Exercise(
                        lesson_id=lesson_id,
                        order_index=1,
                        type="translate",
                        data_json=json.dumps({
                            "prompt": "Translate: 'Hello, good morning'",
                            "word_bank": ["hola", "buenos", "días", "adiós", "noches", "gracias"],
                            "answer": ["hola", "buenos", "días"]
                        })
                    ),
                    models.Exercise(
                        lesson_id=lesson_id,
                        order_index=2,
                        type="fill_blank",
                        data_json=json.dumps({
                            "prompt": "___ días, ¿cómo estás?",
                            "options": ["Buenos", "Buenas", "Buen"],
                            "answer": "Buenos"
                        })
                    ),
                    models.Exercise(
                        lesson_id=lesson_id,
                        order_index=3,
                        type="match_pairs",
                        data_json=json.dumps({
                            "prompt": "Match the pairs",
                            "pairs": [["hola", "hello"], ["gracias", "thank you"], ["adiós", "goodbye"]]
                        })
                    ),
                    models.Exercise(
                        lesson_id=lesson_id,
                        order_index=4,
                        type="type_answer",
                        data_json=json.dumps({
                            "prompt": "Type in Spanish: 'Thank you'",
                            "answer": "Gracias",
                            "accepted_alternates": ["gracias", "muchas gracias"]
                        })
                    )
                ]
            else:
                return [
                    models.Exercise(
                        lesson_id=lesson_id,
                        order_index=0,
                        type="multiple_choice",
                        data_json=json.dumps({
                            "prompt": "Choose the correct translation of 'Goodbye'",
                            "options": ["adiós", "hola", "gracias", "de nada"],
                            "answer": "adiós"
                        })
                    ),
                    models.Exercise(
                        lesson_id=lesson_id,
                        order_index=1,
                        type="translate",
                        data_json=json.dumps({
                            "prompt": "Translate: 'Goodbye, good night'",
                            "word_bank": ["adiós", "buenas", "noches", "días", "hola", "por favor"],
                            "answer": ["adiós", "buenas", "noches"]
                        })
                    ),
                    models.Exercise(
                        lesson_id=lesson_id,
                        order_index=2,
                        type="fill_blank",
                        data_json=json.dumps({
                            "prompt": "Buenas ___, Juan.",
                            "options": ["noches", "días", "tardes"],
                            "answer": "noches"
                        })
                    ),
                    models.Exercise(
                        lesson_id=lesson_id,
                        order_index=3,
                        type="match_pairs",
                        data_json=json.dumps({
                            "prompt": "Match the pairs",
                            "pairs": [["por favor", "please"], ["de nada", "you are welcome"], ["buenas noches", "good night"]]
                        })
                    ),
                    models.Exercise(
                        lesson_id=lesson_id,
                        order_index=4,
                        type="type_answer",
                        data_json=json.dumps({
                            "prompt": "Type in Spanish: 'Please'",
                            "answer": "Por favor",
                            "accepted_alternates": ["por favor", "porfavor"]
                        })
                    )
                ]

        def create_intro_exercises(lesson_id, is_lesson_two=False):
            if not is_lesson_two:
                return [
                    models.Exercise(
                        lesson_id=lesson_id,
                        order_index=0,
                        type="multiple_choice",
                        data_json=json.dumps({
                            "prompt": "Choose the correct translation of 'boy'",
                            "options": ["niño", "niña", "hombre", "mujer"],
                            "answer": "niño"
                        })
                    ),
                    models.Exercise(
                        lesson_id=lesson_id,
                        order_index=1,
                        type="translate",
                        data_json=json.dumps({
                            "prompt": "Translate: 'I am a boy'",
                            "word_bank": ["Yo", "soy", "un", "niño", "una", "niña"],
                            "answer": ["Yo", "soy", "un", "niño"]
                        })
                    ),
                    models.Exercise(
                        lesson_id=lesson_id,
                        order_index=2,
                        type="fill_blank",
                        data_json=json.dumps({
                            "prompt": "Yo ___ una mujer.",
                            "options": ["soy", "eres", "es"],
                            "answer": "soy"
                        })
                    ),
                    models.Exercise(
                        lesson_id=lesson_id,
                        order_index=3,
                        type="match_pairs",
                        data_json=json.dumps({
                            "prompt": "Match the pairs",
                            "pairs": [["hombre", "man"], ["mujer", "woman"], ["niño", "boy"]]
                        })
                    ),
                    models.Exercise(
                        lesson_id=lesson_id,
                        order_index=4,
                        type="type_answer",
                        data_json=json.dumps({
                            "prompt": "Type in Spanish: 'girl'",
                            "answer": "Niña",
                            "accepted_alternates": ["niña", "una niña"]
                        })
                    )
                ]
            else:
                return [
                    models.Exercise(
                        lesson_id=lesson_id,
                        order_index=0,
                        type="multiple_choice",
                        data_json=json.dumps({
                            "prompt": "Choose the correct translation of 'My name is'",
                            "options": ["Me llamo", "Mucho gusto", "Cómo te llamas", "Hola"],
                            "answer": "Me llamo"
                        })
                    ),
                    models.Exercise(
                        lesson_id=lesson_id,
                        order_index=1,
                        type="translate",
                        data_json=json.dumps({
                            "prompt": "Translate: 'Nice to meet you'",
                            "word_bank": ["Mucho", "gusto", "igualmente", "hola", "cómo"],
                            "answer": ["Mucho", "gusto"]
                        })
                    ),
                    models.Exercise(
                        lesson_id=lesson_id,
                        order_index=2,
                        type="fill_blank",
                        data_json=json.dumps({
                            "prompt": "¿Cómo te ___ tú?",
                            "options": ["llamas", "llama", "llamo"],
                            "answer": "llamas"
                        })
                    ),
                    models.Exercise(
                        lesson_id=lesson_id,
                        order_index=3,
                        type="match_pairs",
                        data_json=json.dumps({
                            "prompt": "Match the pairs",
                            "pairs": [["tú", "you"], ["yo", "I"], ["me llamo", "my name is"]]
                        })
                    ),
                    models.Exercise(
                        lesson_id=lesson_id,
                        order_index=4,
                        type="type_answer",
                        data_json=json.dumps({
                            "prompt": "Type in Spanish: 'I am a man'",
                            "answer": "Yo soy un hombre",
                            "accepted_alternates": ["yo soy hombre", "soy un hombre", "soy hombre"]
                        })
                    )
                ]

        def create_cafe_exercises(lesson_id):
            return [
                models.Exercise(
                    lesson_id=lesson_id,
                    order_index=0,
                    type="multiple_choice",
                    data_json=json.dumps({
                        "prompt": "Choose the correct translation of 'coffee'",
                        "options": ["café", "té", "leche", "agua"],
                        "answer": "café"
                    })
                ),
                models.Exercise(
                    lesson_id=lesson_id,
                    order_index=1,
                    type="translate",
                    data_json=json.dumps({
                        "prompt": "Translate: 'A coffee with milk, please'",
                        "word_bank": ["Un", "café", "con", "leche", "por", "favor", "té", "sin"],
                        "answer": ["Un", "café", "con", "leche", "por", "favor"]
                    })
                ),
                models.Exercise(
                    lesson_id=lesson_id,
                    order_index=2,
                    type="fill_blank",
                    data_json=json.dumps({
                        "prompt": "Quiero una taza de ___, por favor.",
                        "options": ["té", "pan", "manzana"],
                        "answer": "té"
                    })
                ),
                models.Exercise(
                    lesson_id=lesson_id,
                    order_index=3,
                    type="match_pairs",
                    data_json=json.dumps({
                        "prompt": "Match the pairs",
                        "pairs": [["café", "coffee"], ["té", "tea"], ["leche", "milk"]]
                    })
                ),
                models.Exercise(
                    lesson_id=lesson_id,
                    order_index=4,
                    type="type_answer",
                    data_json=json.dumps({
                        "prompt": "Type in Spanish: 'The bill, please'",
                        "answer": "La cuenta, por favor",
                        "accepted_alternates": ["la cuenta por favor"]
                    })
                )
            ]

        # 4. Create Lessons and Exercises
        # Greetings has 2 lessons
        g_l1 = models.Lesson(skill_id=greetings.id, order_index=0)
        g_l2 = models.Lesson(skill_id=greetings.id, order_index=1)
        db.add_all([g_l1, g_l2])
        db.commit()
        db.refresh(g_l1)
        db.refresh(g_l2)
        
        db.add_all(create_greetings_exercises(g_l1.id, is_lesson_two=False))
        db.add_all(create_greetings_exercises(g_l2.id, is_lesson_two=True))

        # Introduction has 2 lessons
        i_l1 = models.Lesson(skill_id=intro.id, order_index=0)
        i_l2 = models.Lesson(skill_id=intro.id, order_index=1)
        db.add_all([i_l1, i_l2])
        db.commit()
        db.refresh(i_l1)
        db.refresh(i_l2)
        
        db.add_all(create_intro_exercises(i_l1.id, is_lesson_two=False))
        db.add_all(create_intro_exercises(i_l2.id, is_lesson_two=True))

        # Café has 2 lessons
        c_l1 = models.Lesson(skill_id=cafe.id, order_index=0)
        c_l2 = models.Lesson(skill_id=cafe.id, order_index=1)
        db.add_all([c_l1, c_l2])
        db.commit()
        db.refresh(c_l1)
        db.refresh(c_l2)
        
        db.add_all(create_cafe_exercises(c_l1.id))
        db.add_all(create_cafe_exercises(c_l2.id))

        # Hotel has 2 lessons
        h_l1 = models.Lesson(skill_id=hotel.id, order_index=0)
        h_l2 = models.Lesson(skill_id=hotel.id, order_index=1)
        db.add_all([h_l1, h_l2])
        db.commit()
        db.refresh(h_l1)
        db.refresh(h_l2)
        
        # Give Hotel some default exercises
        db.add_all([
            models.Exercise(lesson_id=h_l1.id, order_index=0, type="multiple_choice", data_json=json.dumps({
                "prompt": "Choose the correct translation of 'hotel'",
                "options": ["hotel", "casa", "aeropuerto", "restaurante"],
                "answer": "hotel"
            })),
            models.Exercise(lesson_id=h_l1.id, order_index=1, type="fill_blank", data_json=json.dumps({
                "prompt": "Quiero una ___ en el hotel.",
                "options": ["habitación", "coche", "mesa"],
                "answer": "habitación"
            }))
        ])

        # Airport has 2 lessons
        a_l1 = models.Lesson(skill_id=airport.id, order_index=0)
        a_l2 = models.Lesson(skill_id=airport.id, order_index=1)
        db.add_all([a_l1, a_l2])
        db.commit()
        db.refresh(a_l1)
        db.refresh(a_l2)
        
        # Give Airport some default exercises
        db.add_all([
            models.Exercise(lesson_id=a_l1.id, order_index=0, type="multiple_choice", data_json=json.dumps({
                "prompt": "Choose the correct translation of 'passport'",
                "options": ["pasaporte", "maleta", "boleto", "avión"],
                "answer": "pasaporte"
            }))
        ])

        db.commit()

        # 5. Seed Users
        # Main User (user_id=1, username="learner", completed Greetings skill, Introduction skill available)
        main_user = models.User(
            id=1,
            username="learner",
            hearts=5,
            gems=450,
            daily_xp_goal=30,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=5)
        )
        db.add(main_user)
        db.commit()

        # Seed progress for main user:
        # Completed Greetings (crowns=2/2, status='completed')
        db.add(models.UserProgress(user_id=1, skill_id=greetings.id, status="completed", crowns=2))
        # Available Introduction (crowns=0/2, status='available')
        db.add(models.UserProgress(user_id=1, skill_id=intro.id, status="available", crowns=0))
        # Seed XP transactions for main user (2 completed lessons)
        db.add(models.XPTransaction(user_id=1, amount=10, source="lesson_complete", created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)))
        db.add(models.XPTransaction(user_id=1, amount=5, source="perfect_lesson_bonus", created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)))
        db.add(models.XPTransaction(user_id=1, amount=10, source="lesson_complete", created_at=datetime.datetime.utcnow()))
        # Seed streak log: completed yesterday and today
        db.add(models.StreakLog(user_id=1, date=datetime.date.today() - datetime.timedelta(days=1)))
        db.add(models.StreakLog(user_id=1, date=datetime.date.today()))
        # Seed achievements
        db.add(models.Achievement(user_id=1, code="first_lesson", earned_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)))
        db.add(models.Achievement(user_id=1, code="perfect_lesson", earned_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)))

        # Seed other users for leaderboard
        user2 = models.User(id=2, username="DuoMascot", created_at=datetime.datetime.utcnow() - datetime.timedelta(days=20))
        user3 = models.User(id=3, username="PolyglotPro", created_at=datetime.datetime.utcnow() - datetime.timedelta(days=15))
        user4 = models.User(id=4, username="LanguageLearner99", created_at=datetime.datetime.utcnow() - datetime.timedelta(days=10))
        user5 = models.User(id=5, username="StreakMaster", created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3))
        
        db.add_all([user2, user3, user4, user5])
        db.commit()

        # Seed XP for other users
        db.add(models.XPTransaction(user_id=2, amount=1200, source="lesson_complete"))
        db.add(models.XPTransaction(user_id=3, amount=850, source="lesson_complete"))
        db.add(models.XPTransaction(user_id=4, amount=450, source="lesson_complete"))
        db.add(models.XPTransaction(user_id=5, amount=320, source="lesson_complete"))
        
        db.commit()
        print("Database successfully seeded!")
        
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
