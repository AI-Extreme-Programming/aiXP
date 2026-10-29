"""Tests for the Mermaid diagram normaliser (print-helper.py diagrams)."""

import unittest

import pikepdf
from pikepdf import Array, Dictionary, Name

import support  # noqa: F401
from print_pdf.diagrams import DiagramError, Report, normalise_pdf, rewrite_colours
from print_pdf.pdfwalk import Interpreter
from print_pdf.pdfx import Result, _ColourVisitor


def diagram(content=b'0.4 0.4 0.4 rg 0 0 10 10 re f 0 0 0 RG 0 0 m 5 5 l S', gs=None, shading=None):
    """A page shaped like Chromium's Mermaid output: RGB greys, a half-transparent
    graphics state, and a transparency-group form drawing a white label background."""
    pdf = pikepdf.new()
    form = pdf.make_stream(b'1 1 1 rg /G1 gs 0 0 5 5 re f', Type=Name.XObject, Subtype=Name.Form,
                           BBox=Array([0, 0, 5, 5]),
                           Group=Dictionary(Type=Name.Group, S=Name.Transparency, I=True),
                           Resources=Dictionary(ExtGState=Dictionary(G1=pdf.make_indirect(Dictionary(
                               Type=Name.ExtGState, ca=1)))))
    resources = Dictionary(XObject=Dictionary(X1=form), ExtGState=Dictionary(
        G4=pdf.make_indirect(gs if gs is not None else Dictionary(Type=Name.ExtGState, ca=0.5))))
    if shading is not None:
        resources.Pattern = Dictionary(P1=pdf.make_indirect(Dictionary(PatternType=2, Shading=shading)))
        content += b' /Pattern cs /P1 scn 0 0 2 2 re f'
    page = Dictionary(Type=Name.Page, MediaBox=Array([0, 0, 100, 100]), Resources=resources,
                      Contents=pdf.make_stream(content + b' /G4 gs /X1 Do'))
    pdf.pages.append(pikepdf.Page(page))
    return pdf


def rgb_shading(c0=(0.8, 0.8, 0.8), c1=(0.9, 0.9, 0.9)):
    return Dictionary(ShadingType=2, ColorSpace=Name.DeviceRGB, Coords=Array([0, 0, 1, 0]),
                      Function=Dictionary(FunctionType=2, Domain=Array([0, 1]), C0=Array(list(c0)),
                                          C1=Array(list(c1)), N=1))


def checker_failures(pdf):
    result = Result()
    Interpreter(_ColourVisitor(result)).run_document(pdf)
    return {rule for rule, messages in result.failures.items() if messages}


class Normalise(unittest.TestCase):
    def test_chromium_style_diagram_becomes_gray_and_opaque(self):
        pdf = diagram(shading=rgb_shading())
        self.assertEqual(checker_failures(pdf), {'colour-spaces', 'transparency'})
        report = normalise_pdf(pdf)
        self.assertEqual(checker_failures(pdf), set())
        self.assertEqual((report.alpha_removed, report.groups_removed, report.shadings_converted), (1, 1, 1))
        self.assertEqual((report.rgb_colours_left, report.shadings_left), (0, 0))

    def test_neutral_rgb_becomes_gray_at_the_same_level(self):
        ops = [([0.4, 0.4, 0.4], pikepdf.Operator('rg')), ([0, 0, 0], pikepdf.Operator('RG'))]
        out = rewrite_colours(ops, Report())
        self.assertEqual([([float(v) for v in o], str(op)) for o, op in out], [([0.4], 'g'), ([0.0], 'G')])

    def test_coloured_rgb_is_left_for_icc_conversion_and_counted(self):
        report = Report()
        out = rewrite_colours([([1, 0, 0], pikepdf.Operator('rg'))], report)
        self.assertEqual(str(out[0][1]), 'rg')
        self.assertEqual(report.rgb_colours_left, 1)

    def test_coloured_shading_is_left_and_counted(self):
        self.assertEqual(normalise_pdf(diagram(shading=rgb_shading(c0=(1, 0, 0)))).shadings_left, 1)

    def test_soft_mask_is_refused(self):
        with self.assertRaises(DiagramError):
            normalise_pdf(diagram(gs=Dictionary(Type=Name.ExtGState, SMask=Dictionary(S=Name.Luminosity))))

    def test_blend_mode_is_refused(self):
        with self.assertRaises(DiagramError):
            normalise_pdf(diagram(gs=Dictionary(Type=Name.ExtGState, BM=Name.Multiply)))


if __name__ == '__main__':
    unittest.main()
