import json
import os
from datetime import datetime, timezone
from pathlib import Path

import google.auth
import gspread

SPREADSHEET_ID = (
    os.getenv("SPREADSHEET_ID")
    or "1fh1p5KSlPYljYypJlON9I1mrxCGdSWvPwwlwFwGUfjU"
)

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
]

OUTPUT = Path("data/dashboard.json")


def number(value, default=0.0):
    if value is None:
        return default

    if isinstance(value, (int, float)):
        return float(value)

    text = str(value).strip()

    if not text:
        return default

    text = (
        text.replace("R$", "")
        .replace("US$", "")
        .replace("%", "")
        .replace("h", "")
        .replace("/mês", "")
        .replace("/semana", "")
        .strip()
    )

    # Formato pt-BR: 2.857,14 -> 2857.14
    if "," in text:
        text = text.replace(".", "").replace(",", ".")

    try:
        return float(text)
    except ValueError:
        return default


def percent(value):
    if isinstance(value, (int, float)):
        # Google Sheets pode retornar percentual como 0.25 ou 25 dependendo do modo.
        return float(value * 100 if 0 <= value <= 1 else value)

    return number(value)


def text(value, fallback="—"):
    value = "" if value is None else str(value).strip()
    return value or fallback


def main():
    creds, _ = google.auth.default(scopes=SCOPES)
    client = gspread.authorize(creds)
    workbook = client.open_by_key(SPREADSHEET_ID)

    dashboard = workbook.worksheet("DASHBOARD")
    config = workbook.worksheet("CONFIG")
    intelligence = workbook.worksheet("INTELIGÊNCIA")
    meta_ninja = workbook.worksheet("META_NINJA")

    # Apenas células agregadas/calculadas. Nenhuma linha transacional é publicada.
    values = dashboard.batch_get([
        "B7", "D7", "F7", "H7", "K7",
        "B13", "E13", "H13", "K13",
        "B18", "E18", "H18", "K18",
        "B22", "D22", "F22", "H22",
        "D24",
        "D30", "D31", "D32", "D33",
        "H30", "H31", "H32",
        "B39", "B40", "E39", "E40",
        "H39", "H40", "K39", "K40",
        "B43",
    ])

    def v(index, fallback=""):
        block = values[index]
        if not block or not block[0]:
            return fallback
        return block[0][0]

    config_values = config.batch_get(["B8", "B13", "B6"])
    meta_ninja_values = meta_ninja.batch_get(["C11", "C14", "C17"])
    intelligence_values = intelligence.batch_get(["C4", "D5", "D7", "D13"])

    def cv(index, fallback=0):
        block = config_values[index]
        if not block or not block[0]:
            return fallback
        return block[0][0]

    def mv(index, fallback=0):
        block = meta_ninja_values[index]
        if not block or not block[0]:
            return fallback
        return block[0][0]

    def iv(index, fallback="—"):
        block = intelligence_values[index]
        if not block or not block[0]:
            return fallback
        return block[0][0]

    data = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "system_status": "operational",
        "financial": {
            "saldo_brl": number(v(0)),
            "receita_mes_brl": number(v(1)),
            "despesas_mes_brl": number(v(2)),
            "cambio_usd_brl": number(v(3)),
            "taxa_freelance_usd_h": number(v(4)),
            "capacidade_livre_h_mes": number(cv(2)),
            "reserva_alvo_brl": number(cv(0)),
        },
        "ninja": {
            "acumulado_brl": number(v(5)),
            "meta_total_brl": number(v(6)),
            "restante_brl": number(v(7)),
            "progresso_pct": percent(v(8)),
            "aporte_mensal_brl": number(mv(0)),
            "horas_mes_necessarias": number(mv(1)),
            "margem_horas_mes": number(mv(2)),
            "prazo": "2027-12-31",
        },
        "freelance": {
            "propostas": int(number(v(13))),
            "entrevistas": int(number(v(14))),
            "contratos": int(number(v(15))),
            "connects": int(number(v(16))),
            "taxa_conversao_pct": percent(v(17)),
            "status_cambio": text(iv(0)),
            "status_meta": text(iv(1)),
            "status_prospeccao": text(iv(2)),
            "status_rentabilidade": text(iv(3)),
        },
        "produtividade": {
            "tarefas_a_fazer": int(number(v(18))),
            "tarefas_em_andamento": int(number(v(19))),
            "tarefas_em_revisao": int(number(v(20))),
            "tarefas_concluidas": int(number(v(21))),
            "estudo_meta_h_semana": number(cv(1)),
            "estudo_realizado_h": number(v(23)),
            "estudo_progresso_pct": percent(v(24)),
            "foco_estudo": text(v(29), "Python"),
        },
        "action_center": {
            "proxima_tarefa": {
                "titulo": text(v(25), "Nenhuma tarefa cadastrada"),
                "detalhe": text(v(26), "Cadastre a próxima entrega na aba TAREFAS."),
            },
            "oportunidade": {
                "titulo": text(v(27), "Pipeline vazio"),
                "detalhe": text(v(28), "Cadastre uma oportunidade para alimentar o funil."),
            },
            "estudo": {
                "titulo": text(v(29), "Python"),
                "detalhe": text(v(30), "Registre horas de estudo na aba ESTUDOS."),
            },
            "meta": {
                "titulo": text(v(31), "Kawasaki Ninja 500"),
                "detalhe": text(v(32), "Meta financeira em acompanhamento."),
            },
            "prioridade": text(v(33), "Cadastre dados reais para ativar a inteligência do sistema."),
        },
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Dashboard JSON atualizado: {OUTPUT}")


if __name__ == "__main__":
    main()
